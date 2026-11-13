import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateProductDto } from './dto/create-product.dto.js';
import { UpdateProductDto } from './dto/update-product.dto.js';
import { AuditService } from '../audit/audit.service.js';
import type { ReqMeta } from '../audit/request-meta.js';

const LABEL: Record<string, string> = { name: 'name', description: 'description', price: 'price', imageUrl: 'image', stockQuantity: 'stock', category: 'category', condition: 'condition', status: 'status' };
const NOTE_ONLY = ['description', 'imageUrl'];
const money = (n: unknown) => Number(n).toLocaleString('en-US');
const show = (field: string, v: unknown) => {
  if (v === null || v === undefined || v === '') return 'empty';
  if (field === 'price') return money(v);
  if (typeof v === 'string') return '"' + v.slice(0, 40) + '"';
  return String(v);
};

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService, private audit: AuditService) {}

  async create(ownerId: string, dto: CreateProductDto, meta: ReqMeta) {
    const store = await this.prisma.store.findUnique({ where: { ownerId } });
    if (!store) throw new NotFoundException('You must create a store first.');
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

  async findPublic(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { store: true },
    });
    if (!product || product.status !== 'ACTIVE' || product.store.status !== 'ACTIVE' || product.store.isPaused) {
      throw new NotFoundException('Product not found');
    }
    const { ownerId, ...publicStore } = product.store;
    return { ...product, store: publicStore };
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
