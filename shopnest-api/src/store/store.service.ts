import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateStoreDto } from './dto/create-store.dto.js';

@Injectable()
export class StoreService {
  constructor(private prisma: PrismaService) {}

  async create(ownerId: string, dto: CreateStoreDto) {
    const existing = await this.prisma.store.findUnique({ where: { ownerId } });
    if (existing) throw new ConflictException('Seller already has a store');
    return this.prisma.store.create({
      data: {
        name: dto.name,
        description: dto.description ?? null,
        ownerId,
      },
    });
  }

  async findMine(ownerId: string) {
    const store = await this.prisma.store.findUnique({ where: { ownerId } });
    if (!store) throw new NotFoundException('No store found for this seller');
    return store;
  }
}