import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { TrackEventDto } from './dto/track-event.dto.js';

type Gran = 'hour' | 'day' | 'month';

// Tanzania is UTC+3 all year (no daylight saving), so buckets follow local time.
const TZ_OFFSET_MS = 3 * 60 * 60 * 1000;
const HOUR = 60 * 60 * 1000;
const KEY_LENGTH: Record<Gran, number> = { hour: 13, day: 10, month: 7 };
const PERIODS: Record<string, { ms: number | null; g: Gran }> = {
  day: { ms: 24 * HOUR, g: 'hour' },
  week: { ms: 7 * 24 * HOUR, g: 'day' },
  month: { ms: 30 * 24 * HOUR, g: 'day' },
  year: { ms: 365 * 24 * HOUR, g: 'month' },
  all: { ms: null, g: 'month' },
};

@Injectable()
export class EventsService {
  constructor(private prisma: PrismaService) {}

  async track(dto: TrackEventDto) {
    let storeId: string;
    let productId: string | null = null;
    if (dto.type === 'SHOP_VIEW') {
      if (!dto.storeSlug) throw new BadRequestException('storeSlug is required');
      const store = await this.prisma.store.findFirst({
        where: { slug: dto.storeSlug, status: 'ACTIVE' },
        select: { id: true },
      });
      if (!store) throw new NotFoundException();
      storeId = store.id;
    } else {
      if (!dto.productId) throw new BadRequestException('productId is required');
      const product = await this.prisma.product.findFirst({
        where: { id: dto.productId, status: 'ACTIVE', store: { status: 'ACTIVE' } },
        select: { id: true, storeId: true },
      });
      if (!product) throw new NotFoundException();
      storeId = product.storeId;
      productId = product.id;
    }
    await this.prisma.storeEvent.create({
      data: { type: dto.type, source: dto.source ?? null, storeId, productId },
    });
    return { ok: true };
  }

  async summary(ownerId: string, period?: string) {
    const store = await this.prisma.store.findUnique({
      where: { ownerId },
      select: { id: true, createdAt: true },
    });
    if (!store) throw new NotFoundException('No store');
    const key = typeof period === 'string' && Object.prototype.hasOwnProperty.call(PERIODS, period) ? period : 'month';
    const cfg = PERIODS[key];
    const now = new Date();
    const since = cfg.ms === null ? store.createdAt : new Date(now.getTime() - cfg.ms);

    const [events, products] = await Promise.all([
      this.prisma.storeEvent.findMany({
        where: { storeId: store.id, createdAt: { gte: since } },
        select: { type: true, productId: true, createdAt: true },
      }),
      this.prisma.product.findMany({
        where: { storeId: store.id, status: { not: 'TRASHED' } },
        select: { id: true, name: true },
      }),
    ]);

    const buckets = new Map<string, { key: string; shopViews: number; productViews: number; whatsappClicks: number }>();
    for (const k of this.bucketKeys(since, now, cfg.g)) {
      buckets.set(k, { key: k, shopViews: 0, productViews: 0, whatsappClicks: 0 });
    }
    const perProduct = new Map<string, { id: string; name: string; views: number; clicks: number }>();
    for (const p of products) perProduct.set(p.id, { id: p.id, name: p.name, views: 0, clicks: 0 });

    const totals = { shopViews: 0, productViews: 0, whatsappClicks: 0 };
    for (const e of events) {
      const b = buckets.get(this.bucketKey(e.createdAt, cfg.g));
      const p = e.productId ? perProduct.get(e.productId) : undefined;
      if (e.type === 'SHOP_VIEW') {
        totals.shopViews++;
        if (b) b.shopViews++;
      } else if (e.type === 'PRODUCT_VIEW') {
        totals.productViews++;
        if (b) b.productViews++;
        if (p) p.views++;
      } else {
        totals.whatsappClicks++;
        if (b) b.whatsappClicks++;
        if (p) p.clicks++;
      }
    }

    return {
      period: key,
      granularity: cfg.g,
      totals,
      buckets: Array.from(buckets.values()),
      products: Array.from(perProduct.values()).sort((a, b) => b.clicks - a.clicks || b.views - a.views),
    };
  }

  private shift(d: Date) {
    return new Date(d.getTime() + TZ_OFFSET_MS);
  }

  private bucketKey(d: Date, g: Gran) {
    return this.shift(d).toISOString().slice(0, KEY_LENGTH[g]);
  }

  private bucketKeys(since: Date, now: Date, g: Gran) {
    const keys: string[] = [];
    const end = this.bucketKey(now, g);
    const cur = this.shift(since);
    if (g === 'hour') cur.setUTCMinutes(0, 0, 0);
    else if (g === 'day') cur.setUTCHours(0, 0, 0, 0);
    else {
      cur.setUTCDate(1);
      cur.setUTCHours(0, 0, 0, 0);
    }
    for (let i = 0; i < 1000; i++) {
      const k = cur.toISOString().slice(0, KEY_LENGTH[g]);
      keys.push(k);
      if (k >= end) break;
      if (g === 'hour') cur.setUTCHours(cur.getUTCHours() + 1);
      else if (g === 'day') cur.setUTCDate(cur.getUTCDate() + 1);
      else cur.setUTCMonth(cur.getUTCMonth() + 1);
    }
    return keys;
  }
}
