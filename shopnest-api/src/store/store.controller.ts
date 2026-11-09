import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { StoreService } from './store.service.js';
import { CreateStoreDto } from './dto/create-store.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';

@Controller('stores')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SELLER')
export class StoreController {
  constructor(private storeService: StoreService) {}

  @Post()
  create(@CurrentUser('sub') ownerId: string, @Body() dto: CreateStoreDto) {
    return this.storeService.create(ownerId, dto);
  }

  @Get('me')
  mine(@CurrentUser('sub') ownerId: string) {
    return this.storeService.findMine(ownerId);
  }
}