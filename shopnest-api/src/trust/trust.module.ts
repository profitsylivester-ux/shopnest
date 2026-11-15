import { Global, Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { TrustService } from './trust.service.js';
import { ReviewsService } from './reviews.service.js';
import { ReviewsController } from './reviews.controller.js';

@Global()
@Module({
  imports: [ThrottlerModule.forRoot([{ ttl: 60000, limit: 30 }])],
  controllers: [ReviewsController],
  providers: [TrustService, ReviewsService],
  exports: [TrustService],
})
export class TrustModule {}
