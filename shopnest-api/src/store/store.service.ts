import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateStoreDto } from './dto/create-store.dto.js';
import { UpdateStoreDto } from './dto/update-store.dto.js';

@Injectable()
export class StoreService {
  constructor(private prisma: PrismaService) {}

  async create(ownerId: string, dto: CreateStoreDto) {
    const existing = await this.prisma.store.findUnique({ where: { ownerId } });
    if (existing) throw new ConflictException('Seller already has a store');
    const slug = dto.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.floor(Math.random() * 1000);
    
    return this.prisma.store.create({
      data: { 
        name: dto.name, 
        slug: slug, 
        description: dto.description ?? null, 
        whatsappNumber: dto.whatsappNumber ?? null, 
        logoUrl: dto.logoUrl ?? null, 
        bannerUrl: dto.bannerUrl ?? null, 
        location: dto.location ?? null,
        shopType: dto.shopType ?? null,
        ownerId 
      },
    });
  }

  async findMine(ownerId: string) {
    const store = await this.prisma.store.findUnique({ where: { ownerId } });
    if (!store) throw new NotFoundException('No store found for this seller');
    return store;
  }

  async update(ownerId: string, dto: UpdateStoreDto) {
    const store = await this.prisma.store.findUnique({ where: { ownerId } });
    if (!store) throw new NotFoundException('Store not found');
    return this.prisma.store.update({ where: { ownerId }, data: dto });
  }

  async findPublic(slug: string) {
    const store = await this.prisma.store.findUnique({
      where: { slug },
      include: { products: { where: { status: 'ACTIVE' }, orderBy: { createdAt: 'desc' } } },
    });
    if (!store || store.status !== 'ACTIVE') throw new NotFoundException('Store not found');
    const { ownerId, ...publicStore } = store;
    return publicStore;
  }

  async getMarketplace() {
    const stores = await this.prisma.store.findMany({
      where: { status: 'ACTIVE' },
      include: { products: { where: { status: 'ACTIVE' } } },
    });
    return stores.map(({ ownerId, ...publicStore }) => publicStore);
  }

  // NEW: Admin Methods
  async getAllStoresForAdmin() {
    return this.prisma.store.findMany({
      include: { owner: { select: { name: true, email: true } } },
      orderBy: { createdAt: 'desc' }
    });
  }

  async updateStoreStatus(id: string, status: any) {
    return this.prisma.store.update({
      where: { id },
      data: { status }
    });
  }
}