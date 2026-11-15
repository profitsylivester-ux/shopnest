import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateProductDto } from './dto/create-product.dto.js';
import { UpdateProductDto } from './dto/update-product.dto.js';
import { AuditService } from '../audit/audit.service.js';
import type { ReqMeta } from '../audit/request-meta.js';
import { TrustService } from '../trust/trust.service.js';

const LABEL: Record<string, string> = { name: 'name', description: 'description', price: 'price', wasPrice: 'old price', imageUrl: 'image', stockQuantity: 'stock', category: 'category', condition: 'condition', status: 'status' };
const NOTE_ONLY = ['description', 'imageUrl'];
const money = (n: unknown) => Number(n).toLocaleString('en-US');
const show = (field: string, v: unknown) => {
  if (v === null || v === undefined || v === '') return 'empty';
  if (field === 'price' || field === 'wasPrice') return money(v);
  if (typeof v === 'string') return '"' + v.slice(0, 40) + '"';
  return String(v);
};

const clampInt = (v: unknown, def: number, min: number, max: number) => {
  const n = typeof v === 'string' ? parseInt(v, 10) : NaN;
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : def;
};
const textOf = (v: unknown, max = 60) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const numOf = (v: unknown) => {
  if (typeof v !== 'string' || v.trim() === '') return null;
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? n : null;
};
const REAL_PICTURE: Prisma.ProductWhereInput = { OR: [{ imageUrl: { startsWith: '/uploads/' } }, { imageUrl: { startsWith: 'http' } }] };

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService, private audit: AuditService, private trust: TrustService) {}

  async create(ownerId: string, dto: CreateProductDto, meta: ReqMeta) {
    const store = await this.prisma.store.findUnique({ where: { ownerId } });
    if (!store) throw new NotFoundException('You must create a store first.');
    this.checkOldPrice(dto.price, dto.wasPrice);
    const product = await this.prisma.product.create({ data: { ...dto, storeId: store.id } });
    await this.audit.log({ userId: ownerId, action: 'PRODUCT_CREATED', summary: 'Added "' + product.name + '" (TZS ' + money(product.price) + ', stock ' + product.stockQuantity + ')', details: { product: { id: product.id, name: product.name, price: product.price, stock: product.stockQuantity } }, ...meta });
    return product;
  }

  async findMine(ownerId: string) {
    const store = await this.prisma.store.findUnique({ where: { ownerId } });
    if (!store) throw new NotFoundException('Store not found.');
    return this.prisma.product.findMany({
      where: { storeId: store.id },
      orderBy: { createdAt: 'desc' },
    });
  }

  async update(ownerId: string, productId: string, dto: UpdateProductDto, meta: ReqMeta) {
    const product = await this.prisma.product.findUnique({ where: { id: productId }, include: { store: true } });
    if (!product) throw new NotFoundException('Product not found.');
    if (product.store.ownerId !== ownerId) throw new ForbiddenException('You can only edit your own products.');
    if (product.status === 'TRASHED') throw new NotFoundException('Product not found.');
    const nextPrice = dto.price !== undefined ? dto.price : product.price;
    const nextWas = dto.wasPrice !== undefined ? dto.wasPrice : product.wasPrice;
    if (dto.price !== undefined || dto.wasPrice !== undefined) this.checkOldPrice(nextPrice, nextWas);
    const changes: { field: string; from?: unknown; to?: unknown; note?: string }[] = [];
    for (const [k, v] of Object.entries(dto as Record<string, any>)) {
      if (v === undefined || !(k in LABEL)) continue;
      const before = (product as any)[k] ?? null;
      if ((before ?? '') === (v ?? '')) continue;
      changes.push(NOTE_ONLY.includes(k) ? { field: k, note: 'changed' } : { field: k, from: before, to: v });
    }
    if (changes.length === 0) {
      const { store: _store, ...plain } = product;
      return plain;
    }
    const updated = await this.prisma.product.update({ where: { id: productId }, data: dto });
    const only = changes.length === 1 ? changes[0] : null;
    if (only && only.field === 'status') {
      const hid = only.to === 'HIDDEN';
      await this.audit.log({ userId: ownerId, action: hid ? 'PRODUCT_HIDDEN' : 'PRODUCT_SHOWN', summary: hid ? 'Hid "' + product.name + '" from buyers' : 'Made "' + product.name + '" visible to buyers', details: { product: { id: product.id, name: product.name } }, ...meta });
    } else {
      const parts = changes.map((c) => (c.note ? LABEL[c.field] + ' changed' : LABEL[c.field] + ' from ' + show(c.field, c.from) + ' to ' + show(c.field, c.to)));
      await this.audit.log({ userId: ownerId, action: 'PRODUCT_UPDATED', summary: 'Edited "' + product.name + '": ' + parts.join('; '), details: { product: { id: product.id, name: product.name }, changes }, ...meta });
    }
    return updated;
  }

  // An "old price" is only allowed when it is really higher than the price, so a discount shown to buyers is always real.
  private checkOldPrice(price: number, was: number | null | undefined) {
    if (was === null || was === undefined) return;
    if (!(was > price)) throw new BadRequestException('The old price must be higher than the price. Leave it empty if there is no discount.');
  }

  async findPublic(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { store: true },
    });
    if (!product || product.status !== 'ACTIVE' || product.store.status !== 'ACTIVE' || product.store.isPaused) {
      throw new NotFoundException('Product not found');
    }
    const { ownerId, verificationRevoked, verificationRevokedReason, verificationRevokedAt, ...publicStore } = product.store;
    const facts = (await this.trust.facts([product.store.id])).get(product.store.id);
    return { ...product, store: { ...publicStore, ...this.trust.publicOf(facts) } };
  }

  async search(q: string) {
    const term = (q || '').trim().slice(0, 60);
    if (term.length < 1) return [];
    return this.prisma.product.findMany({
      where: {
        status: 'ACTIVE',
        store: { status: 'ACTIVE', isPaused: false },
        OR: [
          { name: { contains: term, mode: 'insensitive' } },
          { description: { contains: term, mode: 'insensitive' } },
          { category: { contains: term, mode: 'insensitive' } },
          { store: { name: { contains: term, mode: 'insensitive' } } },
        ],
      },
      include: { store: { select: { name: true, slug: true, whatsappNumber: true, location: true } } },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  // The marketplace page: filtering, sorting and paging all happen here, so the website never downloads every product.
  async browse(raw: Record<string, unknown>) {
    const page = clampInt(raw.page, 1, 1, 1000);
    const limit = clampInt(raw.limit, 24, 1, 48);
    const q = textOf(raw.q);
    const category = textOf(raw.category, 40);
    const condition = textOf(raw.condition, 20);
    const location = textOf(raw.location);
    const shop = textOf(raw.shop);
    const min = numOf(raw.min);
    const max = numOf(raw.max);
    const inStock = raw.inStock === '1';
    const onSale = raw.sale === '1';
    const sort = textOf(raw.sort, 20);
    const verifiedOnly = raw.verified === '1';

    const base: Prisma.ProductWhereInput[] = [{ status: 'ACTIVE', store: { status: 'ACTIVE', isPaused: false } }];
    if (q) {
      base.push({ OR: [
        { name: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { category: { contains: q, mode: 'insensitive' } },
        { store: { name: { contains: q, mode: 'insensitive' } } },
      ] });
    }
    if (['New', 'Used', 'Refurbished'].includes(condition)) base.push({ condition });
    if (min !== null) base.push({ price: { gte: min } });
    if (max !== null) base.push({ price: { lte: max } });
    if (location) base.push({ store: { location: { contains: location, mode: 'insensitive' } } });
    if (shop) base.push({ store: { slug: shop } });
    if (inStock) base.push({ stockQuantity: { gt: 0 } });
    if (onSale) base.push({ wasPrice: { not: null } });
    if (verifiedOnly) base.push({ store: { id: { in: await this.trust.verifiedStoreIds() } } });
    const where: Prisma.ProductWhereInput = { AND: category ? [...base, { category }] : base };
    const orderBy: Prisma.ProductOrderByWithRelationInput[] =
      sort === 'price_asc' ? [{ price: 'asc' }, { createdAt: 'desc' }] : sort === 'price_desc' ? [{ price: 'desc' }, { createdAt: 'desc' }] : [{ createdAt: 'desc' }];

    // Sorting by shop rating cannot be done by the database alone, so the matching products are ranked here and the page is cut afterwards.
    let ranked: string[] | null = null;
    if (sort === 'rating') {
      const all = await this.prisma.product.findMany({ where, select: { id: true, storeId: true, createdAt: true }, orderBy: { createdAt: 'desc' } });
      const facts = await this.trust.facts(all.map((a) => a.storeId));
      ranked = all
        .map((a, i) => ({ id: a.id, score: this.trust.rankScore(facts.get(a.storeId)), i }))
        .sort((x, y) => y.score - x.score || x.i - y.i)
        .map((x) => x.id);
    }
    const pageIds = ranked ? ranked.slice((page - 1) * limit, page * limit) : null;

    const [itemsRaw, total, cats, thumbs, locs] = await Promise.all([
      this.prisma.product.findMany({
        where: pageIds ? { id: { in: pageIds } } : where,
        ...(pageIds ? {} : { orderBy, skip: (page - 1) * limit, take: limit }),
        include: { store: { select: { id: true, name: true, slug: true, location: true, whatsappNumber: true } } },
      }),
      ranked ? Promise.resolve(ranked.length) : this.prisma.product.count({ where }),
      this.prisma.product.groupBy({ by: ['category'], where: { AND: base }, _count: { _all: true } }),
      this.prisma.product.findMany({
        where: { AND: [{ status: 'ACTIVE', store: { status: 'ACTIVE', isPaused: false }, category: { not: null } }, REAL_PICTURE] },
        select: { category: true, imageUrl: true },
        orderBy: { createdAt: 'desc' },
        distinct: ['category'],
      }),
      this.prisma.store.findMany({
        where: { status: 'ACTIVE', isPaused: false, location: { not: null }, products: { some: { status: 'ACTIVE' } } },
        select: { location: true },
        distinct: ['location'],
        orderBy: { location: 'asc' },
      }),
    ]);
    const orderIdx = new Map((pageIds || []).map((id, i) => [id, i]));
    const ordered = pageIds ? [...itemsRaw].sort((a, b) => (orderIdx.get(a.id) ?? 0) - (orderIdx.get(b.id) ?? 0)) : itemsRaw;
    const tf = await this.trust.facts(ordered.map((it) => it.store.id));
    const items = ordered.map((it) => ({ ...it, store: { ...it.store, ...this.trust.publicOf(tf.get(it.store.id)) } }));
    const thumbOf = new Map(thumbs.map((t) => [t.category as string, t.imageUrl as string]));
    return {
      items,
      total,
      page,
      limit,
      pages: Math.max(1, Math.ceil(total / limit)),
      facets: {
        categories: cats.filter((c) => c.category).map((c) => ({ name: c.category as string, count: c._count._all, thumb: thumbOf.get(c.category as string) ?? null })).sort((a, b) => b.count - a.count || a.name.localeCompare(b.name)),
        locations: locs.map((l) => l.location as string),
      },
    };
  }

  async suggest(q: string) {
    const term = (q || '').trim().slice(0, 60);
    if (term.length < 2) return [];
    const rows = await this.prisma.product.findMany({
      where: {
        status: 'ACTIVE',
        store: { status: 'ACTIVE', isPaused: false },
        OR: [
          { name: { contains: term, mode: 'insensitive' } },
          { category: { contains: term, mode: 'insensitive' } },
        ],
      },
      select: { name: true, category: true },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
    const seen = new Set<string>();
    const out: { name: string; category: string | null }[] = [];
    for (const r of rows) {
      const key = r.name.toLowerCase();
      if (!seen.has(key)) { seen.add(key); out.push({ name: r.name, category: r.category }); }
      if (out.length >= 6) break;
    }
    return out;
  }

  async findPublicImage(id: string) {
    const product = await this.prisma.product.findFirst({
      where: { id, status: 'ACTIVE', store: { status: 'ACTIVE', isPaused: false } },
      select: { imageUrl: true },
    });
    const m = product?.imageUrl?.match(/^data:(image\/(?:png|jpeg|webp|gif|avif));base64,([A-Za-z0-9+/=]+)$/);
    if (!m) throw new NotFoundException();
    return { mime: m[1], buffer: Buffer.from(m[2], 'base64') };
  }

  // --- ADMIN METHODS ---
  async getAllProductsAdmin() {
    return this.prisma.product.findMany({
      where: { status: { not: 'TRASHED' } },
      include: { store: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateProductStatusAdmin(id: string, status: any, adminId: string) {
    if (!['ACTIVE', 'HIDDEN', 'TRASHED'].includes(status)) throw new BadRequestException('Invalid status');
    const p = await this.prisma.product.findUnique({ where: { id }, select: { name: true, status: true, store: { select: { ownerId: true } } } });
    if (!p) throw new NotFoundException('Product not found');
    const updated = await this.prisma.product.update({ where: { id }, data: { status } });
    if (p.status !== status) {
      await this.audit.log({ userId: p.store.ownerId, actorId: adminId, actorRole: 'ADMIN', action: 'ADMIN_PRODUCT_STATUS', summary: 'Admin changed "' + p.name + '" from ' + p.status + ' to ' + status, details: { changes: [{ field: 'status', from: p.status, to: status }] } });
    }
    return updated;
  }

  async getTrashed() {
    return this.prisma.product.findMany({
      where: { status: 'TRASHED' },
      include: { store: { select: { name: true } } },
    });
  }

  async restoreProduct(id: string, adminId: string) {
    const p = await this.prisma.product.findUnique({ where: { id }, select: { name: true, store: { select: { ownerId: true } } } });
    if (!p) throw new NotFoundException('Product not found');
    const updated = await this.prisma.product.update({ where: { id }, data: { status: 'ACTIVE' } });
    await this.audit.log({ userId: p.store.ownerId, actorId: adminId, actorRole: 'ADMIN', action: 'ADMIN_PRODUCT_RESTORED', summary: 'Admin restored "' + p.name + '"' });
    return updated;
  }
}
