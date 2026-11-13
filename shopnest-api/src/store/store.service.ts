import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateStoreDto } from './dto/create-store.dto.js';
import { UpdateStoreDto } from './dto/update-store.dto.js';
import { AuditService } from '../audit/audit.service.js';
import type { ReqMeta } from '../audit/request-meta.js';

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const HHMM = /^([01]\d|2[0-3]):[0-5]\d$/;
const STATUSES = ['PENDING', 'ACTIVE', 'SUSPENDED'];
const REQUIRED = ['name', 'whatsappNumber'];
const EMPTY_TO_NULL = ['description', 'location', 'logoUrl', 'bannerUrl', 'instagramUrl', 'facebookUrl', 'tiktokUrl', 'openingHours', 'deliveryReturns', 'announcement'];
const IMAGE_OR_LONG = ['logoUrl', 'bannerUrl', 'description', 'openingHours', 'deliveryReturns'];
const LABEL: Record<string, string> = { name: 'shop name', description: 'description', whatsappNumber: 'WhatsApp number', logoUrl: 'logo', bannerUrl: 'banner', location: 'location', shopType: 'shop type', instagramUrl: 'Instagram link', facebookUrl: 'Facebook link', tiktokUrl: 'TikTok link', openingHours: 'opening hours', deliveryReturns: 'delivery and returns', announcement: 'announcement', isPaused: 'vacation mode' };

function validHours(raw: string): boolean {
  try {
    const a = JSON.parse(raw);
    if (!Array.isArray(a) || a.length !== 7) return false;
    return a.every((d) => d && typeof d.closed === 'boolean' && (d.closed || (HHMM.test(String(d.open)) && HHMM.test(String(d.close)))));
  } catch {
    return false;
  }
}

@Injectable()
export class StoreService {
  constructor(private prisma: PrismaService, private audit: AuditService) {}

  async create(ownerId: string, dto: CreateStoreDto, meta: ReqMeta) {
    const existing = await this.prisma.store.findUnique({ where: { ownerId } });
    if (existing) throw new ConflictException('Seller already has a store');
    const slug = dto.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.floor(Math.random() * 1000);
    const store = await this.prisma.store.create({
      data: {
        name: dto.name,
        slug: slug,
        description: dto.description ?? null,
        whatsappNumber: dto.whatsappNumber ?? null,
        logoUrl: dto.logoUrl ?? null,
        bannerUrl: dto.bannerUrl ?? null,
        location: dto.location ?? null,
        shopType: dto.shopType ?? null,
        ownerId,
      },
    });
    await this.audit.log({ userId: ownerId, action: 'STORE_CREATED', summary: 'Shop "' + store.name + '" created and sent for admin review', ...meta });
    return store;
  }

  async findMine(ownerId: string) {
    const store = await this.prisma.store.findUnique({ where: { ownerId } });
    if (!store) throw new NotFoundException('No store found for this seller');
    return store;
  }

  async update(ownerId: string, dto: UpdateStoreDto, meta: ReqMeta) {
    const store = await this.prisma.store.findUnique({ where: { ownerId } });
    if (!store) throw new NotFoundException('Store not found');
    const data: Record<string, any> = {};
    for (const [k, raw] of Object.entries(dto as Record<string, any>)) {
      if (raw === undefined || !(k in LABEL)) continue;
      let v: any = raw;
      if (typeof v === 'string') {
        v = v.trim();
        if (REQUIRED.includes(k) && v === '') throw new BadRequestException(LABEL[k] + ' cannot be empty');
        if (EMPTY_TO_NULL.includes(k) && v === '') v = null;
      }
      data[k] = v;
    }
    if (typeof data.openingHours === 'string' && !validHours(data.openingHours)) throw new BadRequestException('Opening hours are not valid');
    const changes: { field: string; from?: unknown; to?: unknown; note?: string }[] = [];
    for (const k of Object.keys(data)) {
      const before = (store as any)[k] ?? null;
      if (before === data[k]) continue;
      changes.push(IMAGE_OR_LONG.includes(k) ? { field: k, note: 'changed' } : { field: k, from: before, to: data[k] });
    }
    if (changes.length === 0) return store;
    const updated = await this.prisma.store.update({ where: { ownerId }, data: data as any });
    const pause = changes.find((c) => c.field === 'isPaused');
    const rest = changes.filter((c) => c.field !== 'isPaused');
    if (rest.length > 0) await this.audit.log({ userId: ownerId, action: 'STORE_UPDATED', summary: 'Updated shop: ' + rest.map((c) => LABEL[c.field]).join(', '), details: { changes: rest }, ...meta });
    if (pause) await this.audit.log({ userId: ownerId, action: pause.to ? 'STORE_PAUSED' : 'STORE_RESUMED', summary: pause.to ? 'Vacation mode turned on. Your shop and products are hidden from buyers.' : 'Vacation mode turned off. Your shop is visible again.', ...meta });
    return updated;
  }

  private normSlug(raw: unknown) { return String(raw ?? '').trim().toLowerCase(); }
  private slugFormatError(s: string) { return s.length < 3 || s.length > 40 || !SLUG_RE.test(s) ? 'Use 3 to 40 letters, numbers and single hyphens.' : null; }

  async slugAvailable(ownerId: string, raw: string) {
    const s = this.normSlug(raw);
    const bad = this.slugFormatError(s);
    if (bad) return { slug: s, available: false, message: bad };
    const store = await this.prisma.store.findUnique({ where: { ownerId }, select: { slug: true } });
    if (!store) throw new NotFoundException('Store not found');
    if (store.slug === s) return { slug: s, available: true, message: 'This is your current link.' };
    const other = await this.prisma.store.findUnique({ where: { slug: s }, select: { id: true } });
    return other ? { slug: s, available: false, message: 'That link is already taken.' } : { slug: s, available: true, message: 'This link is free.' };
  }

  async changeSlug(ownerId: string, raw: string, meta: ReqMeta) {
    const s = this.normSlug(raw);
    const bad = this.slugFormatError(s);
    if (bad) throw new BadRequestException(bad);
    const store = await this.prisma.store.findUnique({ where: { ownerId } });
    if (!store) throw new NotFoundException('Store not found');
    if (store.slug === s) return store;
    try {
      const updated = await this.prisma.store.update({ where: { ownerId }, data: { slug: s } });
      await this.audit.log({ userId: ownerId, action: 'STORE_SLUG_CHANGED', summary: 'Shop link changed from /store/' + store.slug + ' to /store/' + s, details: { changes: [{ field: 'slug', from: store.slug, to: s }] }, ...meta });
      return updated;
    } catch (e: any) {
      if (e?.code === 'P2002') throw new ConflictException('That link is already taken.');
      throw e;
    }
  }

  async findPublic(slug: string) {
    const store = await this.prisma.store.findUnique({
      where: { slug },
      include: { products: { where: { status: 'ACTIVE' }, orderBy: { createdAt: 'desc' } } },
    });
    if (!store || store.status !== 'ACTIVE') throw new NotFoundException('Store not found');
    const { ownerId, ...publicStore } = store;
    return store.isPaused ? { ...publicStore, products: [] } : publicStore;
  }

  async getMarketplace() {
    const stores = await this.prisma.store.findMany({
      where: { status: 'ACTIVE', isPaused: false },
      include: { products: { where: { status: 'ACTIVE' } } },
    });
    return stores.map(({ ownerId, ...publicStore }) => publicStore);
  }

  async getAllStoresForAdmin() {
    return this.prisma.store.findMany({
      include: { owner: { select: { name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateStoreStatus(id: string, status: any, adminId: string) {
    if (!STATUSES.includes(status)) throw new BadRequestException('Invalid status');
    const store = await this.prisma.store.findUnique({ where: { id }, select: { ownerId: true, status: true } });
    if (!store) throw new NotFoundException('Store not found');
    const updated = await this.prisma.store.update({ where: { id }, data: { status } });
    if (store.status !== status) {
      await this.audit.log({ userId: store.ownerId, actorId: adminId, actorRole: 'ADMIN', action: 'ADMIN_STORE_STATUS', summary: 'Admin changed your shop status from ' + store.status + ' to ' + status, details: { changes: [{ field: 'status', from: store.status, to: status }] } });
    }
    return updated;
  }
}
