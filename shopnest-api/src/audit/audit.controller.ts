import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { AuditService } from './audit.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';

@Controller('audit')
export class AuditController {
  constructor(private audit: AuditService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  mine(@CurrentUser('sub') userId: string, @Query('limit') limit?: string, @Query('skip') skip?: string, @Query('category') category?: string) {
    return this.audit.list(userId, limit, skip, category);
  }

  @Get('user/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  forUser(@Param('id') id: string, @Query('limit') limit?: string, @Query('skip') skip?: string, @Query('category') category?: string) {
    return this.audit.list(id, limit, skip, category);
  }
}
