import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { EventsService } from './events.service.js';
import { TrackEventDto } from './dto/track-event.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';

@Controller('events')
export class EventsController {
  constructor(private eventsService: EventsService) {}

  @Post()
  @UseGuards(ThrottlerGuard)
  track(@Body() dto: TrackEventDto) {
    return this.eventsService.track(dto);
  }

  @Get('me/summary')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SELLER')
  summary(@CurrentUser('sub') ownerId: string, @Query('period') period?: string) {
    return this.eventsService.summary(ownerId, period);
  }
}
