import { Body, Controller, Delete, Get, Param, Patch, Put, Query, Req, UseGuards } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { ReviewsService } from './reviews.service.js';
import { ReviewDto } from './dto/review.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { reqMeta } from '../audit/request-meta.js';

@Controller()
export class ReviewsController {
  constructor(private reviews: ReviewsService) {}

  // public
  @Get('stores/:slug/reviews')
  list(@Param('slug') slug: string, @Query('page') page?: string, @Query('limit') limit?: string) { return this.reviews.list(slug, page, limit); }

  // signed in
  @Get('stores/:slug/reviews/mine') @UseGuards(JwtAuthGuard)
  mine(@Param('slug') slug: string, @CurrentUser('sub') userId: string) { return this.reviews.mine(slug, userId); }

  @Put('stores/:slug/reviews') @UseGuards(JwtAuthGuard, ThrottlerGuard)
  save(@Param('slug') slug: string, @CurrentUser('sub') userId: string, @CurrentUser('role') role: string, @Body() dto: ReviewDto, @Req() req: any) { return this.reviews.upsert(slug, userId, role, dto, reqMeta(req)); }

  @Delete('stores/:slug/reviews/mine') @UseGuards(JwtAuthGuard, ThrottlerGuard)
  remove(@Param('slug') slug: string, @CurrentUser('sub') userId: string, @Req() req: any) { return this.reviews.removeMine(slug, userId, reqMeta(req)); }

  // seller
  @Get('reviews/me') @UseGuards(JwtAuthGuard, RolesGuard) @Roles('SELLER')
  forSeller(@CurrentUser('sub') ownerId: string, @Query('page') page?: string, @Query('limit') limit?: string) { return this.reviews.forSeller(ownerId, page, limit); }

  // admin
  @Get('admin/reviews') @UseGuards(JwtAuthGuard, RolesGuard) @Roles('ADMIN')
  adminList(@Query('status') status?: string, @Query('q') q?: string, @Query('page') page?: string, @Query('limit') limit?: string) { return this.reviews.adminList(status, q, page, limit); }

  @Patch('admin/reviews/:id') @UseGuards(JwtAuthGuard, RolesGuard) @Roles('ADMIN')
  adminSet(@Param('id') id: string, @Body('status') status: string, @CurrentUser('sub') adminId: string, @Req() req: any) { return this.reviews.adminSetStatus(id, status, adminId, reqMeta(req)); }

  @Patch('admin/shops/:id/verification') @UseGuards(JwtAuthGuard, RolesGuard) @Roles('ADMIN')
  adminVerification(@Param('id') id: string, @Body('revoked') revoked: boolean, @Body('reason') reason: string, @CurrentUser('sub') adminId: string, @Req() req: any) { return this.reviews.adminVerification(id, revoked === true, reason, adminId, reqMeta(req)); }
}
