import { describe, it, expect } from 'vitest';
import { ServiceUnavailableException } from '@nestjs/common';
import { HealthController } from './health.controller.js';

describe('HealthController', () => {
  it('says ok when the database answers', async () => {
    const c = new HealthController({ $queryRaw: async () => [{ '?column?': 1 }] } as any);
    expect(await c.check()).toEqual({ status: 'ok', database: true });
  });
  it('answers 503 when the database cannot be reached', async () => {
    const c = new HealthController({ $queryRaw: async () => { throw new Error('down'); } } as any);
    await expect(c.check()).rejects.toBeInstanceOf(ServiceUnavailableException);
  });
});
