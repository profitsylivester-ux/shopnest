import { describe, it, expect } from 'vitest';
import { checkRequiredEnv, frontendOrigins, jsonLimit, listenPort, rateLimitPerMinute, trustProxyHops } from './env.js';

describe('env settings', () => {
  it('defaults suit your own computer', () => {
    expect(frontendOrigins({})).toEqual(['http://localhost:3000']);
    expect(listenPort({})).toBe(3001);
    expect(trustProxyHops({})).toBe(0);
    expect(jsonLimit({})).toBe('2mb');
    expect(rateLimitPerMinute({})).toBe(600);
  });
  it('reads several website addresses and strips trailing slashes', () => {
    expect(frontendOrigins({ FRONTEND_ORIGINS: 'https://a.onrender.com/, https://b.example.com' })).toEqual(['https://a.onrender.com', 'https://b.example.com']);
  });
  it('ignores nonsense values', () => {
    expect(listenPort({ PORT: 'abc' })).toBe(3001);
    expect(listenPort({ PORT: '10000' })).toBe(10000);
    expect(trustProxyHops({ TRUST_PROXY: '99' })).toBe(0);
    expect(trustProxyHops({ TRUST_PROXY: '1' })).toBe(1);
    expect(jsonLimit({ JSON_LIMIT: 'huge' })).toBe('2mb');
    expect(jsonLimit({ JSON_LIMIT: '500KB' })).toBe('500kb');
    expect(rateLimitPerMinute({ RATE_LIMIT_PER_MIN: '5' })).toBe(600);
  });
  it('the live server must have its main settings, your computer need not', () => {
    expect(checkRequiredEnv({})).toEqual([]);
    const p = checkRequiredEnv({ NODE_ENV: 'production' });
    expect(p.length).toBe(3);
    expect(checkRequiredEnv({ NODE_ENV: 'production', DATABASE_URL: 'x', JWT_SECRET: 'a'.repeat(32), FRONTEND_ORIGINS: 'https://x.com' })).toEqual([]);
    expect(checkRequiredEnv({ NODE_ENV: 'production', DATABASE_URL: 'x', JWT_SECRET: 'short', FRONTEND_ORIGINS: 'https://x.com' })).toHaveLength(1);
  });
});
