import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { AuthModule } from './auth/auth.module.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { StoreModule } from './store/store.module.js';
import { ProductsModule } from './products/products.module.js';
import { SettingsModule } from './settings/settings.module.js';
import { EventsModule } from './events/events.module.js';

@Module({
  imports: [PrismaModule, AuthModule, StoreModule, ProductsModule, SettingsModule, EventsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}