import { Controller, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { reqMeta } from '../audit/request-meta.js';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AdminController {
  constructor(private admin: AdminService) {}

  @Get('overview')
  overview(@Query('period') period?: string) {
    return this.admin.overview(period);
  }

  @Get('shops')
  shops(@Query('q') q?: string, @Query('status') status?: string, @Query('sort') sort?: string, @Query('limit') limit?: string, @Query('skip') skip?: string) {
    return this.admin.shops(q, status, sort, limit, skip);
  }

  @Get('users')
  users(@Query('q') q?: string, @Query('role') role?: string, @Query('limit') limit?: string, @Query('skip') skip?: string) {
    return this.admin.users(q, role, limit, skip);
  }

  @Post('users/:id/force-logout')
  forceLogout(@Param('id') id: string, @CurrentUser('sub') adminId: string, @Req() req: any) {
    return this.admin.forceLogout(id, adminId, reqMeta(req));
  }

  @Get('products/facets')
  facets() {
    return this.admin.productFacets();
  }

  @Get('products')
  products(@Query('q') q?: string, @Query('status') status?: string, @Query('storeId') storeId?: string, @Query('category') category?: string, @Query('limit') limit?: string, @Query('skip') skip?: string) {
    return this.admin.products(q, status, storeId, category, limit, skip);
  }
}
