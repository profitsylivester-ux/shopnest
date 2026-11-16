import { describe, it, expect } from 'vitest';
import { createRateLimiter } from './rate-limit.js';

function run(mw: any, req: any) {
  let status = 200; let body: any = null; let called = false; const headers: any = {};
  const res: any = { setHeader: (k: string, v: string) => { headers[k] = v; }, status(c: number) { status = c; return this; }, json(b: any) { body = b; } };
  mw(req, res, () => { called = true; });
  return { status, body, called, headers };
}

describe('rate limiter', () => {
  it('lets a visitor through up to the limit, then answers 429 with Retry-After', () => {
    let t = 1000;
    const mw = createRateLimiter({ windowMs: 60000, max: 3, now: () => t });
    for (let i = 0; i < 3; i++) expect(run(mw, { ip: '1.1.1.1', path: '/x' }).called).toBe(true);
    const r = run(mw, { ip: '1.1.1.1', path: '/x' });
    expect(r.called).toBe(false);
    expect(r.status).toBe(429);
    expect(r.headers['Retry-After']).toBe('60');
  });
  it('counts each visitor address separately', () => {
    const mw = createRateLimiter({ windowMs: 60000, max: 1, now: () => 5 });
    expect(run(mw, { ip: '1.1.1.1', path: '/x' }).called).toBe(true);
    expect(run(mw, { ip: '2.2.2.2', path: '/x' }).called).toBe(true);
    expect(run(mw, { ip: '1.1.1.1', path: '/x' }).status).toBe(429);
  });
  it('starts again when the minute is over', () => {
    let t = 0;
    const mw = createRateLimiter({ windowMs: 60000, max: 1, now: () => t });
    expect(run(mw, { ip: '1.1.1.1', path: '/x' }).called).toBe(true);
    expect(run(mw, { ip: '1.1.1.1', path: '/x' }).status).toBe(429);
    t = 60001;
    expect(run(mw, { ip: '1.1.1.1', path: '/x' }).called).toBe(true);
  });
  it('does not count skipped paths and forgets old addresses', () => {
    let t = 0;
    const mw = createRateLimiter({ windowMs: 1000, max: 1, now: () => t, skip: (r) => r.path === '/health' });
    for (let i = 0; i < 5; i++) expect(run(mw, { ip: '1.1.1.1', path: '/health' }).called).toBe(true);
    expect(mw.size()).toBe(0);
    run(mw, { ip: '3.3.3.3', path: '/x' });
    expect(mw.size()).toBe(1);
    t = 5000;
    run(mw, { ip: '4.4.4.4', path: '/x' });
    expect(mw.size()).toBe(1);
  });
});
