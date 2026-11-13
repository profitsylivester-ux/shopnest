import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateProductDto } from './dto/create-product.dto.js';
import { UpdateProductDto } from './dto/update-product.dto.js';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async create(ownerId: string, dto: CreateProductDto) {
    const store = await this.prisma.store.findUnique({ where: { ownerId } });
    if (!store) throw new NotFoundException('You must create a store first.');
    return this.prisma.product.create({
      data: { ...dto, storeId: store.id },
    });
  }

  async findMine(ownerId: string) {
    const store = await this.prisma.store.findUnique({ where: { ownerId } });
    if (!store) throw new NotFoundException('Store not found.');
    return this.prisma.product.findMany({
      where: { storeId: store.id },
      orderBy: { createdAt: 'desc' },
    });
  }

  async update(ownerId: string, productId: string, dto: UpdateProductDto) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      include: { store: true },
    });
    if (!product) throw new NotFoundException('Product not found.');
    if (product.store.ownerId !== ownerId) throw new ForbiddenException('You can only edit your own products.');
    if (product.status === 'TRASHED') throw new NotFoundException('Product not found.');
    return this.prisma.product.update({ where: { id: productId }, data: dto });
  }

  async findPublic(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { store: true },
    });
    if (!product || product.status !== 'ACTIVE' || product.store.status !== 'ACTIVE') {
      throw new NotFoundException('Product not found');
    }
    const { ownerId, ...publicStore } = product.store;
    return { ...product, store: publicStore };
  }

  // --- ADMIN METHODS ---
  async search(q: string) {
    const term = (q || '').trim().slice(0, 60);
    if (term.length < 1) return [];
    return this.prisma.product.findMany({
      where: {
        status: 'ACTIVE',
        store: { status: 'ACTIVE' },
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
        store: { status: 'ACTIVE' },
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

  async getAllProductsAdmin() {
    return this.prisma.product.findMany({
      where: { status: { not: 'TRASHED' } },
      include: { store: { select: { name: true } } },
      orderBy: { createdAt: 'desc' }
    });
  }

  async updateProductStatusAdmin(id: string, status: any) {
    return this.prisma.product.update({
      where: { id },
      data: { status }
    });
  }

  async getTrashed() {
    return this.prisma.product.findMany({
      where: { status: 'TRASHED' },
      include: { store: { select: { name: true } } }
    });
  }

  async restoreProduct(id: string) {
    return this.prisma.product.update({
      where: { id },
      data: { status: 'ACTIVE' }
    });
  }
}