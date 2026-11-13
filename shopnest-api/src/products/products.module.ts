import { ThrottlerModule } from '@nestjs/throttler';
import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller.js';
import { ProductsService } from './products.service.js';

@Module({
  imports: [ThrottlerModule.forRoot([{ ttl: 60000, limit: 120 }])],
  controllers: [ProductsController],
  providers: [ProductsService],
})
export class ProductsModule {}