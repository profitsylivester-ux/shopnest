import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { ContentService } from './content.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { reqMeta } from '../audit/request-meta.js';

@Controller('content')
export class ContentController {
  constructor(private content: ContentService) {}

  @Get('categories') categories() { return this.content.publicCategories(); }
  @Get('banners') banners() { return this.content.publicBanners(); }
  @Get('menu') menu() { return this.content.publicMenu(); }
  @Get('pages') pages() { return this.content.publicPages(); }
  @Get('pages/:slug') page(@Param('slug') slug: string) { return this.content.publicPage(slug); }
}

@Controller('admin/content')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AdminContentController {
  constructor(private content: ContentService) {}

  @Get('categories') categories() { return this.content.adminCategories(); }
  @Post('categories') addCategory(@Body() b: unknown, @CurrentUser('sub') a: string, @Req() r: any) { return this.content.createCategory(b, a, reqMeta(r)); }
  @Patch('categories/:id') editCategory(@Param('id') id: string, @Body() b: unknown, @CurrentUser('sub') a: string, @Req() r: any) { return this.content.updateCategory(id, b, a, reqMeta(r)); }
  @Delete('categories/:id') removeCategory(@Param('id') id: string, @CurrentUser('sub') a: string, @Req() r: any) { return this.content.deleteCategory(id, a, reqMeta(r)); }

  @Get('banners') banners() { return this.content.adminBanners(); }
  @Post('banners') addBanner(@Body() b: unknown, @CurrentUser('sub') a: string, @Req() r: any) { return this.content.createBanner(b, a, reqMeta(r)); }
  @Patch('banners/:id') editBanner(@Param('id') id: string, @Body() b: unknown, @CurrentUser('sub') a: string, @Req() r: any) { return this.content.updateBanner(id, b, a, reqMeta(r)); }
  @Delete('banners/:id') removeBanner(@Param('id') id: string, @CurrentUser('sub') a: string, @Req() r: any) { return this.content.deleteBanner(id, a, reqMeta(r)); }

  @Get('menu') menu() { return this.content.adminMenu(); }
  @Post('menu') addMenu(@Body() b: unknown, @CurrentUser('sub') a: string, @Req() r: any) { return this.content.createMenuItem(b, a, reqMeta(r)); }
  @Patch('menu/:id') editMenu(@Param('id') id: string, @Body() b: unknown, @CurrentUser('sub') a: string, @Req() r: any) { return this.content.updateMenuItem(id, b, a, reqMeta(r)); }
  @Delete('menu/:id') removeMenu(@Param('id') id: string, @CurrentUser('sub') a: string, @Req() r: any) { return this.content.deleteMenuItem(id, a, reqMeta(r)); }

  @Get('pages') pages() { return this.content.adminPages(); }
  @Post('pages') addPage(@Body() b: unknown, @CurrentUser('sub') a: string, @Req() r: any) { return this.content.createPage(b, a, reqMeta(r)); }
  @Patch('pages/:id') editPage(@Param('id') id: string, @Body() b: unknown, @CurrentUser('sub') a: string, @Req() r: any) { return this.content.updatePage(id, b, a, reqMeta(r)); }
  @Delete('pages/:id') removePage(@Param('id') id: string, @CurrentUser('sub') a: string, @Req() r: any) { return this.content.deletePage(id, a, reqMeta(r)); }
}
