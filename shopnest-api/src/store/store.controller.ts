import { Body, Controller, Get, Post, Patch, Param, UseGuards } from '@nestjs/common';
import { StoreService } from './store.service.js';
import { CreateStoreDto } from './dto/create-store.dto.js';
import { UpdateStoreDto } from './dto/update-store.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';

@Controller('stores')
export class StoreController {
  constructor(private storeService: StoreService) {}

  @Get('marketplace')
  getMarketplace() {
    return this.storeService.getMarketplace();
  }

  @Get('admin/all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  getAllForAdmin() {
    return this.storeService.getAllStoresForAdmin();
  }

  @Patch('admin/:id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  updateStatus(@Param('id') id: string, @Body('status') status: any) {
    return this.storeService.updateStoreStatus(id, status);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SELLER')
  create(@CurrentUser('sub') ownerId: string, @Body() dto: CreateStoreDto) {
    return this.storeService.create(ownerId, dto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SELLER')
  mine(@CurrentUser('sub') ownerId: string) {
    return this.storeService.findMine(ownerId);
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SELLER')
  update(@CurrentUser('sub') ownerId: string, @Body() dto: UpdateStoreDto) {
    return this.storeService.update(ownerId, dto);
  }

  @Get(':slug')
  findPublic(@Param('slug') slug: string) {
    return this.storeService.findPublic(slug);
  }
}