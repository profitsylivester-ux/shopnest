import { describe, it, expect } from 'vitest';
import { NEED_PRODUCTS, NEED_VISITORS_ONLINE, NEED_VISITORS_PHYSICAL, TOP_MIN_AVG, TOP_MIN_REVIEWS, TrustService, needVisitorsFor } from './trust.service.js';

// The agreed Verified and Top Rated rules (Chief, 13 and 15 Nov), checked against the real service code.
function fakePrisma(o: { shopType: string; revoked?: boolean; products: number; visitors: number; reviews?: { avg: number; count: number } }) {
  return {
    store: { findMany: async () => [{ id: 's1', shopType: o.shopType, verificationRevoked: !!o.revoked }] },
    review: { groupBy: async () => (o.reviews ? [{ storeId: 's1', _avg: { rating: o.reviews.avg }, _count: { _all: o.reviews.count } }] : []) },
    product: { groupBy: async () => [{ storeId: 's1', _count: { _all: o.products } }] },
    $queryRaw: async () => [{ storeId: 's1', n: o.visitors }],
  } as any;
}
async function facts(o: Parameters<typeof fakePrisma>[0]) {
  return (await new TrustService(fakePrisma(o)).facts(['s1'])).get('s1')!;
}

describe('Verified rule', () => {
  it('needs 10 visitors for a physical shop or Both, and 20 for online only', () => {
    expect(needVisitorsFor('Physical')).toBe(NEED_VISITORS_PHYSICAL);
    expect(needVisitorsFor('Both')).toBe(NEED_VISITORS_PHYSICAL);
    expect(needVisitorsFor('Online')).toBe(NEED_VISITORS_ONLINE);
    expect(NEED_PRODUCTS).toBe(10);
  });
  it('a physical shop with 10 products and 10 visitors is verified, one visitor fewer is not', async () => {
    expect((await facts({ shopType: 'Physical', products: 10, visitors: 10 })).verified).toBe(true);
    expect((await facts({ shopType: 'Physical', products: 10, visitors: 9 })).verified).toBe(false);
    expect((await facts({ shopType: 'Physical', products: 9, visitors: 50 })).verified).toBe(false);
  });
  it('an online-only shop needs 20 visitors', async () => {
    expect((await facts({ shopType: 'Online', products: 10, visitors: 19 })).verified).toBe(false);
    expect((await facts({ shopType: 'Online', products: 10, visitors: 20 })).verified).toBe(true);
  });
  it('an earned badge is lost while the team has removed it', async () => {
    const f = await facts({ shopType: 'Physical', products: 12, visitors: 30, revoked: true });
    expect(f.verified).toBe(false);
    expect(f.revoked).toBe(true);
  });
});

describe('Top Rated rule', () => {
  it('needs at least 3 reviews and an average of 4.0', async () => {
    expect(TOP_MIN_REVIEWS).toBe(3);
    expect(TOP_MIN_AVG).toBe(4);
    expect((await facts({ shopType: 'Online', products: 0, visitors: 0, reviews: { avg: 4.0, count: 3 } })).topRated).toBe(true);
    expect((await facts({ shopType: 'Online', products: 0, visitors: 0, reviews: { avg: 4.0, count: 2 } })).topRated).toBe(false);
    expect((await facts({ shopType: 'Online', products: 0, visitors: 0, reviews: { avg: 3.9, count: 10 } })).topRated).toBe(false);
  });
  it('shows no rating when there are no reviews', async () => {
    const f = await facts({ shopType: 'Online', products: 0, visitors: 0 });
    expect(f.ratingAvg).toBeNull();
    expect(f.ratingCount).toBe(0);
  });
  it('the public view hides the counts of shops that are not verified', async () => {
    const svc = new TrustService(fakePrisma({ shopType: 'Online', products: 3, visitors: 2 }));
    const f = (await svc.facts(['s1'])).get('s1')!;
    expect(svc.publicOf(f)).toMatchObject({ verified: false, vProducts: 0, vVisitors: 0 });
  });
});
