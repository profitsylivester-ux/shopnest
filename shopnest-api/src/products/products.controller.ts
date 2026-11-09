import { Controller, Post, Get, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { ProductsService } from './products.service.js';
import { CreateProductDto } from './dto/create-product.dto.js';
import { UpdateProductDto } from './dto/update-product.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';

@Controller('products')
export class ProductsController {
  constructor(private productsService: ProductsService) {}

  @Get('public/:id')
  findPublic(@Param('id') id: string) {
    return this.productsService.findPublic(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SELLER')
  create(@CurrentUser('sub') userId: string, @Body() dto: CreateProductDto) {
    return this.productsService.create(userId, dto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SELLER')
  findMine(@CurrentUser('sub') userId: string) {
    return this.productsService.findMine(userId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SELLER')
  update(@CurrentUser('sub') userId: string, @Param('id') productId: string, @Body() dto: UpdateProductDto) {
    return this.productsService.update(userId, productId, dto);
  }
}