import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import { AuditService } from '../audit/audit.service.js';
import { ReqMeta } from '../audit/request-meta.js';
import { PERIODS, SQL_FORMAT, bucketKey, bucketKeys } from '../common/buckets.js';
import { paging } from '../common/validate.js';

const STORE_STATUSES = ['PENDING', 'ACTIVE', 'SUSPENDED'];
const PRODUCT_STATUSES = ['ACTIVE', 'HIDDEN', 'TRASHED'];
const ROLES = ['BUYER', 'SELLER', 'ADMIN'];

function oneOf<T extends string>(v: unknown, list: T[]): T | null {
  return typeof v === 'string' && (list as string[]).includes(v) ? (v as T) : null;
}
function cleanQ(q?: string) {
  const s = typeof q === 'string' ? q.trim().slice(0, 80) : '';
  return s || null;
}

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService, private audit: AuditService) {}

  // ---------- Overview ----------
  async overview(period?: string) {
    const key = typeof period === 'string' && Object.prototype.hasOwnProperty.call(PERIODS, period) ? period : 'month';
    const cfg = PERIODS[key];
    const now = new Date();
    let since: Date;
    if (cfg.ms === null) {
      const first = await this.prisma.storeEvent.aggregate({ _min: { createdAt: true } });
      since = first._min.createdAt ?? now;
    } else since = new Date(now.getTime() - cfg.ms);
    const prevSince = cfg.ms === null ? null : new Date(since.getTime() - cfg.ms);
    const inPeriod = { createdAt: { gte: since } };

    const [usersByRole, shopsByStatus, pausedShops, productsByStatus, activeCategories, newUsers, newShops, newProducts, eventGroups, prevGroups, buckets, visitors, pending] =
      await Promise.all([
        this.prisma.user.groupBy({ by: ['role'], _count: { _all: true } }),
        this.prisma.store.groupBy({ by: ['status'], _count: { _all: true } }),
        this.prisma.store.count({ where: { isPaused: true } }),
        this.prisma.product.groupBy({ by: ['status'], _count: { _all: true } }),
        this.prisma.category.count({ where: { isActive: true } }),
        this.prisma.user.count({ where: inPeriod }),
        this.prisma.store.count({ where: inPeriod }),
        this.prisma.product.count({ where: { ...inPeriod, status: { not: 'TRASHED' } } }),
        this.prisma.storeEvent.groupBy({ by: ['type'], where: inPeriod, _count: { _all: true } }),
        prevSince ? this.prisma.storeEvent.groupBy({ by: ['type'], where: { createdAt: { gte: prevSince, lt: since } }, _count: { _all: true } }) : Promise.resolve(null),
        this.bucketRows(since, cfg.g),
        this.prisma.$queryRaw<{ all: bigint; clickers: bigint }[]>(Prisma.sql`
          SELECT COUNT(DISTINCT "visitorId") AS "all",
                 COUNT(DISTINCT "visitorId") FILTER (WHERE "type" = 'WHATSAPP_CLICK') AS "clickers"
          FROM "StoreEvent" WHERE "createdAt" >= ${since} AND "visitorId" IS NOT NULL`),
        this.prisma.store.findMany({ where: { status: 'PENDING' }, orderBy: { createdAt: 'asc' }, take: 5, select: { id: true, name: true, createdAt: true } }),
      ]);

    const totals = (rows: { type: string; _count: { _all: number } }[] | null) => {
      const t = { shopViews: 0, productViews: 0, whatsappClicks: 0 };
      for (const r of rows ?? []) {
        if (r.type === 'SHOP_VIEW') t.shopViews = r._count._all;
        else if (r.type === 'PRODUCT_VIEW') t.productViews = r._count._all;
        else if (r.type === 'WHATSAPP_CLICK') t.whatsappClicks = r._count._all;
      }
      return t;
    };

    const map = new Map<string, { key: string; shopViews: number; productViews: number; whatsappClicks: number }>();
    for (const k of bucketKeys(since, now, cfg.g)) map.set(k, { key: k, shopViews: 0, productViews: 0, whatsappClicks: 0 });
    for (const r of buckets) {
      const b = map.get(r.k);
      if (!b) continue;
      const n = Number(r.n);
      if (r.type === 'SHOP_VIEW') b.shopViews += n;
      else if (r.type === 'PRODUCT_VIEW') b.productViews += n;
      else if (r.type === 'WHATSAPP_CLICK') b.whatsappClicks += n;
    }

    const [topShops, topProducts] = await Promise.all([this.topShops(since), this.topProducts(since)]);
    const count = (rows: any[], field: string, val: string): number => rows.find((r) => r[field] === val)?._count._all ?? 0;

    return {
      period: key,
      granularity: cfg.g,
      since,
      users: { total: usersByRole.reduce((a, r) => a + r._count._all, 0), buyers: count(usersByRole, 'role', 'BUYER'), sellers: count(usersByRole, 'role', 'SELLER'), admins: count(usersByRole, 'role', 'ADMIN') },
      shops: { total: shopsByStatus.reduce((a, r) => a + r._count._all, 0), active: count(shopsByStatus, 'status', 'ACTIVE'), pending: count(shopsByStatus, 'status', 'PENDING'), suspended: count(shopsByStatus, 'status', 'SUSPENDED'), paused: pausedShops },
      products: { total: productsByStatus.reduce((a, r) => a + (r.status === 'TRASHED' ? 0 : r._count._all), 0), active: count(productsByStatus, 'status', 'ACTIVE'), hidden: count(productsByStatus, 'status', 'HIDDEN'), trashed: count(productsByStatus, 'status', 'TRASHED') },
      activeCategories,
      newInPeriod: { users: newUsers, shops: newShops, products: newProducts },
      totals: totals(eventGroups),
      previous: prevGroups ? totals(prevGroups) : null,
      visitors: { unique: Number(visitors[0]?.all ?? 0), whatsappUnique: Number(visitors[0]?.clickers ?? 0) },
      buckets: Array.from(map.values()),
      topShops,
      topProducts,
      attention: { pendingShops: pending },
    };
  }

  private bucketRows(since: Date, g: 'hour' | 'day' | 'month') {
    const fmt = Prisma.raw("'" + SQL_FORMAT[g] + "'");
    return this.prisma.$queryRaw<{ k: string; type: string; n: bigint }[]>(Prisma.sql`
      SELECT to_char("createdAt" + interval '3 hours', ${fmt}) AS k, "type"::text AS type, COUNT(*) AS n
      FROM "StoreEvent" WHERE "createdAt" >= ${since} GROUP BY 1, 2`);
  }

  private async topShops(since: Date) {
    const rows = await this.prisma.storeEvent.groupBy({ by: ['storeId', 'type'], where: { createdAt: { gte: since } }, _count: { _all: true } });
    const agg = new Map<string, { views: number; clicks: number }>();
    for (const r of rows) {
      const a = agg.get(r.storeId) ?? { views: 0, clicks: 0 };
      if (r.type === 'WHATSAPP_CLICK') a.clicks += r._count._all;
      else a.views += r._count._all;
      agg.set(r.storeId, a);
    }
    const top = Array.from(agg.entries()).sort((a, b) => b[1].clicks - a[1].clicks || b[1].views - a[1].views).slice(0, 5);
    const stores = await this.prisma.store.findMany({ where: { id: { in: top.map((t) => t[0]) } }, select: { id: true, name: true, slug: true } });
    return top.map(([id, a]) => ({ id, name: stores.find((s) => s.id === id)?.name ?? 'Deleted shop', slug: stores.find((s) => s.id === id)?.slug ?? null, views: a.views, clicks: a.clicks }));
  }

  private async topProducts(since: Date) {
    const rows = await this.prisma.storeEvent.groupBy({ by: ['productId', 'type'], where: { createdAt: { gte: since }, productId: { not: null } }, _count: { _all: true } });
    const agg = new Map<string, { views: number; clicks: number }>();
    for (const r of rows) {
      if (!r.productId) continue;
      const a = agg.get(r.productId) ?? { views: 0, clicks: 0 };
      if (r.type === 'WHATSAPP_CLICK') a.clicks += r._count._all;
      else a.views += r._count._all;
      agg.set(r.productId, a);
    }
    const top = Array.from(agg.entries()).sort((a, b) => b[1].clicks - a[1].clicks || b[1].views - a[1].views).slice(0, 5);
    const prods = await this.prisma.product.findMany({ where: { id: { in: top.map((t) => t[0]) } }, select: { id: true, name: true, store: { select: { name: true } } } });
    return top.map(([id, a]) => ({ id, name: prods.find((p) => p.id === id)?.name ?? 'Deleted product', shop: prods.find((p) => p.id === id)?.store.name ?? '', views: a.views, clicks: a.clicks }));
  }

  // ---------- Shops ----------
  async shops(q?: string, status?: string, sort?: string, limit?: string, skip?: string) {
    const search = cleanQ(q);
    const st = oneOf(status, STORE_STATUSES);
    const where: Prisma.StoreWhereInput = {
      ...(st ? { status: st as any } : {}),
      ...(search ? { OR: [{ name: { contains: search, mode: 'insensitive' } }, { slug: { contains: search, mode: 'insensitive' } }, { owner: { email: { contains: search, mode: 'insensitive' } } }, { owner: { name: { contains: search, mode: 'insensitive' } } }] } : {}),
    };
    const orderBy: Prisma.StoreOrderByWithRelationInput = sort === 'oldest' ? { createdAt: 'asc' } : sort === 'name' ? { name: 'asc' } : sort === 'status' ? { status: 'asc' } : { createdAt: 'desc' };
    const p = paging(limit, skip, 20, 100);
    const [total, rows, counts] = await Promise.all([
      this.prisma.store.count({ where }),
      this.prisma.store.findMany({
        where, orderBy, ...p,
        select: {
          id: true, name: true, slug: true, status: true, isPaused: true, location: true, whatsappNumber: true, logoUrl: true, createdAt: true, ownerId: true,
          owner: { select: { name: true, email: true } },
          _count: { select: { products: { where: { status: { not: 'TRASHED' } } }, events: { where: { type: 'WHATSAPP_CLICK' } } } },
        },
      }),
      this.prisma.store.groupBy({ by: ['status'], _count: { _all: true } }),
    ]);
    return {
      total,
      counts: { all: counts.reduce((a, r) => a + r._count._all, 0), PENDING: counts.find((c) => c.status === 'PENDING')?._count._all ?? 0, ACTIVE: counts.find((c) => c.status === 'ACTIVE')?._count._all ?? 0, SUSPENDED: counts.find((c) => c.status === 'SUSPENDED')?._count._all ?? 0 },
      items: rows.map((s) => ({ id: s.id, name: s.name, slug: s.slug, status: s.status, isPaused: s.isPaused, location: s.location, whatsappNumber: s.whatsappNumber, logoUrl: s.logoUrl && !s.logoUrl.startsWith('data:') ? s.logoUrl : null, createdAt: s.createdAt, ownerId: s.ownerId, ownerName: s.owner.name, ownerEmail: s.owner.email, products: s._count.products, enquiries: s._count.events })),
    };
  }

  // ---------- Users ----------
  async users(q?: string, role?: string, limit?: string, skip?: string) {
    const search = cleanQ(q);
    const r = oneOf(role, ROLES);
    const where: Prisma.UserWhereInput = {
      ...(r ? { role: r as any } : {}),
      ...(search ? { OR: [{ email: { contains: search, mode: 'insensitive' } }, { name: { contains: search, mode: 'insensitive' } }] } : {}),
    };
    const p = paging(limit, skip, 20, 100);
    const [total, rows] = await Promise.all([
      this.prisma.user.count({ where }),
      this.prisma.user.findMany({ where, orderBy: { createdAt: 'desc' }, ...p, select: { id: true, email: true, name: true, role: true, createdAt: true, store: { select: { id: true, name: true, slug: true, status: true } } } }),
    ]);
    return { total, items: rows };
  }

  async forceLogout(userId: string, adminId: string, meta: ReqMeta) {
    if (userId === adminId) throw new BadRequestException('Use Sign out for your own account');
    const u = await this.prisma.user.findUnique({ where: { id: userId }, select: { id: true, email: true } });
    if (!u) throw new NotFoundException('User not found');
    await this.prisma.user.update({ where: { id: userId }, data: { tokenVersion: { increment: 1 } } });
    await this.audit.log({ userId, actorId: adminId, actorRole: 'ADMIN', action: 'ADMIN_FORCE_LOGOUT', summary: 'Admin signed you out of all devices', ...meta });
    return { ok: true };
  }

  // ---------- Products ----------
  async products(q?: string, status?: string, storeId?: string, category?: string, limit?: string, skip?: string) {
    const search = cleanQ(q);
    const st = oneOf(status, PRODUCT_STATUSES);
    const cat = cleanQ(category);
    const where: Prisma.ProductWhereInput = {
      ...(st ? { status: st as any } : { status: { not: 'TRASHED' } }),
      ...(storeId && /^[0-9a-f-]{36}$/i.test(storeId) ? { storeId } : {}),
      ...(cat ? { category: cat === '__none' ? null : cat } : {}),
      ...(search ? { OR: [{ name: { contains: search, mode: 'insensitive' } }, { store: { name: { contains: search, mode: 'insensitive' } } }] } : {}),
    };
    const p = paging(limit, skip, 20, 100);
    const [total, rows] = await Promise.all([
      this.prisma.product.count({ where }),
      this.prisma.product.findMany({ where, orderBy: { createdAt: 'desc' }, ...p, select: { id: true, name: true, price: true, imageUrl: true, status: true, category: true, stockQuantity: true, createdAt: true, store: { select: { id: true, name: true, slug: true } } } }),
    ]);
    return { total, items: rows.map((r) => ({ ...r, imageUrl: r.imageUrl && !r.imageUrl.startsWith('data:') ? r.imageUrl : null })) };
  }

  async productFacets() {
    const [shops, cats, trashed] = await Promise.all([
      this.prisma.store.findMany({ orderBy: { name: 'asc' }, select: { id: true, name: true } }),
      this.prisma.product.groupBy({ by: ['category'], where: { status: { not: 'TRASHED' } }, _count: { _all: true } }),
      this.prisma.product.count({ where: { status: 'TRASHED' } }),
    ]);
    return { shops, categories: cats.map((c) => c.category).filter((c): c is string => !!c).sort(), trashed };
  }
}
