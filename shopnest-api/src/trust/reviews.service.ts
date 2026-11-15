import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import { AuditService } from '../audit/audit.service.js';
import type { ReqMeta } from '../audit/request-meta.js';
import { TrustService } from './trust.service.js';

const APPROVAL_KEY = 'reviewsRequireApproval';
const clampInt = (v: unknown, def: number, min: number, max: number) => {
  const n = typeof v === 'string' ? parseInt(v, 10) : NaN;
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : def;
};
// Only the first name is ever shown to the public.
const firstName = (name: string) => (String(name || '').trim().split(/\s+/)[0] || 'Buyer').slice(0, 30);
const cleanComment = (raw: unknown) => {
  const t = typeof raw === 'string' ? raw.replace(/\s+/g, ' ').trim() : '';
  return t ? t.slice(0, 500) : null;
};

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService, private audit: AuditService, private trust: TrustService) {}

  private async approvalOn() {
    const row = await this.prisma.setting.findUnique({ where: { key: APPROVAL_KEY } });
    return row?.value === 'true';
  }

  private async activeStore(slug: string) {
    const s = String(slug || '').toLowerCase().slice(0, 80);
    const store = await this.prisma.store.findUnique({ where: { slug: s }, select: { id: true, name: true, slug: true, status: true, ownerId: true } });
    if (!store || store.status !== 'ACTIVE') throw new NotFoundException('Store not found');
    return store;
  }

  private async summary(storeId: string) {
    const rows = await this.prisma.review.groupBy({ by: ['rating'], where: { storeId, status: 'VISIBLE' }, _count: { _all: true } });
    const distribution = [5, 4, 3, 2, 1].map((r) => ({ stars: r, count: rows.find((x) => x.rating === r)?._count._all ?? 0 }));
    const count = distribution.reduce((a, d) => a + d.count, 0);
    const sum = distribution.reduce((a, d) => a + d.stars * d.count, 0);
    return { count, avg: count > 0 ? Math.round((sum / count) * 10) / 10 : null, distribution };
  }

  // Public list of visible reviews for one shop.
  async list(slug: string, page?: string, limit?: string) {
    const store = await this.activeStore(slug);
    const pg = clampInt(page, 1, 1, 1000);
    const lim = clampInt(limit, 10, 1, 30);
    const where: Prisma.ReviewWhereInput = { storeId: store.id, status: 'VISIBLE' };
    const [items, total, summary] = await Promise.all([
      this.prisma.review.findMany({ where, orderBy: { createdAt: 'desc' }, skip: (pg - 1) * lim, take: lim, select: { id: true, rating: true, comment: true, createdAt: true, user: { select: { name: true } } } }),
      this.prisma.review.count({ where }),
      this.summary(store.id),
    ]);
    return {
      total, page: pg, pages: Math.max(1, Math.ceil(total / lim)), summary,
      approvalRequired: await this.approvalOn(),
      items: items.map((r) => ({ id: r.id, rating: r.rating, comment: r.comment, createdAt: r.createdAt, author: firstName(r.user.name) })),
    };
  }

  // The signed-in buyer's own review of this shop (any status), so the form can show it.
  async mine(slug: string, userId: string) {
    const store = await this.activeStore(slug);
    const r = await this.prisma.review.findUnique({ where: { storeId_userId: { storeId: store.id, userId } }, select: { id: true, rating: true, comment: true, status: true, createdAt: true, updatedAt: true } });
    return { review: r, isOwner: store.ownerId === userId };
  }

  async upsert(slug: string, userId: string, role: string, dto: { rating: number; comment?: string }, meta: ReqMeta) {
    const store = await this.activeStore(slug);
    if (role === 'ADMIN') throw new ForbiddenException('Admin accounts cannot write reviews.');
    if (store.ownerId === userId) throw new ForbiddenException('You cannot review your own shop.');
    const rating = Math.round(Number(dto.rating));
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) throw new BadRequestException('Choose 1 to 5 stars.');
    const comment = cleanComment(dto.comment);
    const approval = await this.approvalOn();
    const existing = await this.prisma.review.findUnique({ where: { storeId_userId: { storeId: store.id, userId } } });
    // A review an admin hid stays hidden when the buyer edits it; otherwise the current approval mode decides.
    const status = existing?.status === 'HIDDEN' ? 'HIDDEN' : approval ? 'PENDING' : 'VISIBLE';
    const saved = existing
      ? await this.prisma.review.update({ where: { id: existing.id }, data: { rating, comment, status } })
      : await this.prisma.review.create({ data: { storeId: store.id, userId, rating, comment, status } });
    await this.audit.log({ userId, action: existing ? 'REVIEW_UPDATED' : 'REVIEW_CREATED', summary: (existing ? 'You updated your review of ' : 'You reviewed ') + store.name + ' (' + rating + ' stars)', ...meta });
    return { id: saved.id, rating: saved.rating, comment: saved.comment, status: saved.status };
  }

  async removeMine(slug: string, userId: string, meta: ReqMeta) {
    const store = await this.activeStore(slug);
    const existing = await this.prisma.review.findUnique({ where: { storeId_userId: { storeId: store.id, userId } } });
    if (!existing) throw new NotFoundException('You have not reviewed this shop.');
    await this.prisma.review.delete({ where: { id: existing.id } });
    await this.audit.log({ userId, action: 'REVIEW_DELETED', summary: 'You deleted your review of ' + store.name, ...meta });
    return { ok: true };
  }

  // The seller's own view: visible reviews, the summary, and how many are waiting for approval.
  async forSeller(ownerId: string, page?: string, limit?: string) {
    const store = await this.prisma.store.findUnique({ where: { ownerId }, select: { id: true, verificationRevokedReason: true } });
    if (!store) throw new NotFoundException('You do not have a shop yet.');
    const pg = clampInt(page, 1, 1, 1000);
    const lim = clampInt(limit, 20, 1, 50);
    const where: Prisma.ReviewWhereInput = { storeId: store.id, status: 'VISIBLE' };
    const [items, total, summary, awaiting] = await Promise.all([
      this.prisma.review.findMany({ where, orderBy: { createdAt: 'desc' }, skip: (pg - 1) * lim, take: lim, select: { id: true, rating: true, comment: true, createdAt: true, user: { select: { name: true } } } }),
      this.prisma.review.count({ where }),
      this.summary(store.id),
      this.prisma.review.count({ where: { storeId: store.id, status: 'PENDING' } }),
    ]);
    const f = (await this.trust.facts([store.id])).get(store.id);
    const trust = f ? { verified: f.verified, revoked: f.revoked, revokedReason: f.revoked ? store.verificationRevokedReason : null, products: f.products, visitors: f.visitors, needProducts: f.needProducts, needVisitors: f.needVisitors, topRated: f.topRated } : null;
    return { total, page: pg, summary, awaiting, trust, items: items.map((r) => ({ id: r.id, rating: r.rating, comment: r.comment, createdAt: r.createdAt, author: firstName(r.user.name) })) };
  }

  // ---------- admin ----------
  async adminList(status?: string, q?: string, page?: string, limit?: string) {
    const st = ['VISIBLE', 'PENDING', 'HIDDEN'].includes(String(status)) ? (status as 'VISIBLE' | 'PENDING' | 'HIDDEN') : undefined;
    const search = typeof q === 'string' ? q.trim().slice(0, 60) : '';
    const pg = clampInt(page, 1, 1, 1000);
    const lim = clampInt(limit, 20, 1, 100);
    const where: Prisma.ReviewWhereInput = {
      ...(st ? { status: st } : {}),
      ...(search ? { OR: [{ comment: { contains: search, mode: 'insensitive' } }, { store: { name: { contains: search, mode: 'insensitive' } } }, { user: { email: { contains: search, mode: 'insensitive' } } }] } : {}),
    };
    const [items, total, grouped] = await Promise.all([
      this.prisma.review.findMany({ where, orderBy: { createdAt: 'desc' }, skip: (pg - 1) * lim, take: lim, select: { id: true, rating: true, comment: true, status: true, createdAt: true, store: { select: { id: true, name: true, slug: true } }, user: { select: { name: true, email: true } } } }),
      this.prisma.review.count({ where }),
      this.prisma.review.groupBy({ by: ['status'], _count: { _all: true } }),
    ]);
    const c = (s: string) => grouped.find((g) => g.status === s)?._count._all ?? 0;
    return { total, page: pg, counts: { VISIBLE: c('VISIBLE'), PENDING: c('PENDING'), HIDDEN: c('HIDDEN') }, approvalRequired: await this.approvalOn(), items };
  }

  async adminSetStatus(id: string, status: string, adminId: string, meta: ReqMeta) {
    if (!['VISIBLE', 'HIDDEN'].includes(status)) throw new BadRequestException('Status must be VISIBLE or HIDDEN.');
    const r = await this.prisma.review.findUnique({ where: { id }, select: { id: true, status: true, store: { select: { name: true, ownerId: true } } } });
    if (!r) throw new NotFoundException('Review not found');
    if (r.status === status) return { ok: true, status };
    await this.prisma.review.update({ where: { id }, data: { status: status as any } });
    const word = status === 'HIDDEN' ? 'hid' : r.status === 'PENDING' ? 'approved' : 'restored';
    await this.audit.log({ userId: r.store.ownerId, actorId: adminId, actorRole: 'ADMIN', action: 'ADMIN_REVIEW_MODERATED', summary: 'Admin ' + word + ' a review of your shop', details: { changes: [{ field: 'review status', from: r.status, to: status }] }, ...meta });
    return { ok: true, status };
  }

  // Admin removes or restores the automatic Verified badge of one shop.
  async adminVerification(storeId: string, revoked: boolean, reason: string | undefined, adminId: string, meta: ReqMeta) {
    const store = await this.prisma.store.findUnique({ where: { id: storeId }, select: { id: true, name: true, ownerId: true, verificationRevoked: true } });
    if (!store) throw new NotFoundException('Shop not found');
    const why = typeof reason === 'string' ? reason.trim().slice(0, 200) : '';
    if (revoked && why.length < 3) throw new BadRequestException('Please write a short reason (at least 3 letters).');
    await this.prisma.store.update({ where: { id: storeId }, data: revoked ? { verificationRevoked: true, verificationRevokedReason: why, verificationRevokedAt: new Date() } : { verificationRevoked: false, verificationRevokedReason: null, verificationRevokedAt: null } });
    await this.audit.log({ userId: store.ownerId, actorId: adminId, actorRole: 'ADMIN', action: revoked ? 'ADMIN_BADGE_REMOVED' : 'ADMIN_BADGE_RESTORED', summary: revoked ? 'Admin removed the Verified badge from your shop: ' + why : 'Admin restored the Verified badge rule for your shop', ...meta });
    const f = (await this.trust.facts([storeId])).get(storeId);
    return { ok: true, verified: !!f?.verified, revoked };
  }
}
