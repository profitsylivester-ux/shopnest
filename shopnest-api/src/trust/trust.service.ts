import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';

// The agreed Verified rule (Chief, 13 and 15 Nov): a physical shop (or "Both") needs 10 active products and
// 10 different visitors who tapped WhatsApp; an online-only shop needs 10 active products and 20 different visitors.
// Visitors are counted once each (unique visitorId), so tapping many times does not help.
export const NEED_PRODUCTS = 10;
export const NEED_VISITORS_PHYSICAL = 10;
export const NEED_VISITORS_ONLINE = 20;
// "Top Rated": at least 3 visible reviews and an average of 4.0 or more.
export const TOP_MIN_REVIEWS = 3;
export const TOP_MIN_AVG = 4.0;

export type TrustFacts = {
  ratingAvg: number | null;
  ratingCount: number;
  topRated: boolean;
  verified: boolean;
  revoked: boolean;
  products: number;
  visitors: number;
  needProducts: number;
  needVisitors: number;
};

export function needVisitorsFor(shopType: string | null | undefined): number {
  return shopType === 'Physical' || shopType === 'Both' ? NEED_VISITORS_PHYSICAL : NEED_VISITORS_ONLINE;
}

@Injectable()
export class TrustService {
  constructor(private prisma: PrismaService) {}

  // Real numbers for a set of shops, computed from reviews, active products and unique WhatsApp visitors.
  async facts(storeIds: string[]): Promise<Map<string, TrustFacts>> {
    const ids = Array.from(new Set(storeIds.filter(Boolean)));
    const out = new Map<string, TrustFacts>();
    if (ids.length === 0) return out;
    const [stores, ratings, products, visitors] = await Promise.all([
      this.prisma.store.findMany({ where: { id: { in: ids } }, select: { id: true, shopType: true, verificationRevoked: true } }),
      this.prisma.review.groupBy({ by: ['storeId'], where: { storeId: { in: ids }, status: 'VISIBLE' }, _avg: { rating: true }, _count: { _all: true } }),
      this.prisma.product.groupBy({ by: ['storeId'], where: { storeId: { in: ids }, status: 'ACTIVE' }, _count: { _all: true } }),
      this.prisma.$queryRaw<{ storeId: string; n: number }[]>(Prisma.sql`SELECT "storeId", COUNT(DISTINCT "visitorId")::int AS n FROM "StoreEvent" WHERE "type" = 'WHATSAPP_CLICK' AND "visitorId" IS NOT NULL AND "storeId" IN (${Prisma.join(ids)}) GROUP BY "storeId"`),
    ]);
    for (const s of stores) {
      const r = ratings.find((x) => x.storeId === s.id);
      const count = r?._count._all ?? 0;
      const avg = r && count > 0 && r._avg.rating !== null ? Math.round(r._avg.rating * 10) / 10 : null;
      const prod = products.find((x) => x.storeId === s.id)?._count._all ?? 0;
      const vis = visitors.find((x) => x.storeId === s.id)?.n ?? 0;
      const needV = needVisitorsFor(s.shopType);
      const earned = prod >= NEED_PRODUCTS && vis >= needV;
      out.set(s.id, {
        ratingAvg: avg,
        ratingCount: count,
        topRated: count >= TOP_MIN_REVIEWS && avg !== null && avg >= TOP_MIN_AVG,
        verified: earned && !s.verificationRevoked,
        revoked: s.verificationRevoked,
        products: prod,
        visitors: vis,
        needProducts: NEED_PRODUCTS,
        needVisitors: needV,
      });
    }
    return out;
  }

  // What the public site is allowed to see about a shop.
  publicOf(f: TrustFacts | undefined) {
    if (!f) return { ratingAvg: null, ratingCount: 0, topRated: false, verified: false, vProducts: 0, vVisitors: 0 };
    return { ratingAvg: f.ratingAvg, ratingCount: f.ratingCount, topRated: f.topRated, verified: f.verified, vProducts: f.verified ? f.products : 0, vVisitors: f.verified ? f.visitors : 0 };
  }

  // Adds rating and Verified information to shop objects that have an id.
  async decorate<T extends { id: string }>(stores: T[]) {
    const map = await this.facts(stores.map((s) => s.id));
    return stores.map((s) => ({ ...s, ...this.publicOf(map.get(s.id)) }));
  }

  async verifiedStoreIds(): Promise<string[]> {
    const rows = await this.prisma.store.findMany({ where: { status: 'ACTIVE', isPaused: false }, select: { id: true } });
    const map = await this.facts(rows.map((r) => r.id));
    return rows.filter((r) => map.get(r.id)?.verified).map((r) => r.id);
  }

  // Best rated first: shops with reviews before shops without, then higher average, then more reviews.
  rankScore(f: TrustFacts | undefined): number {
    if (!f || f.ratingCount === 0 || f.ratingAvg === null) return -1;
    return f.ratingAvg * 1000 + Math.min(f.ratingCount, 999);
  }
}
