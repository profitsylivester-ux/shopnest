import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { EventsController } from './events.controller.js';
import { EventsService } from './events.service.js';

@Module({
  imports: [ThrottlerModule.forRoot([{ ttl: 60000, limit: 300 }])],
  controllers: [EventsController],
  providers: [EventsService],
})
export class EventsModule {}
