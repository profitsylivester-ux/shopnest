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
      include: { store: true }
    });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  // --- ADMIN METHODS ---
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