import { describe, it, expect } from 'vitest';
import { AuthController } from './auth.controller.js';

// The controller only hands requests to the service, so a stand-in service is enough to check that.
describe('AuthController', () => {
  it('passes a login request and the request details to the service', async () => {
    const calls: any[] = [];
    const service: any = { login: async (dto: any, meta: any) => { calls.push([dto, meta]); return { access_token: 'x' }; } };
    const controller = new AuthController(service);
    const out = await controller.login({ email: 'a@b.co', password: 'secret123' } as any, { ip: '::ffff:41.1.2.3', headers: { 'user-agent': 'test' } } as any);
    expect(out).toEqual({ access_token: 'x' });
    expect(calls).toHaveLength(1);
    expect(calls[0][0].email).toBe('a@b.co');
    expect(calls[0][1].ip).toBe('41.1.2.3');
  });

  it('me returns the signed-in user', () => {
    const controller = new AuthController({} as any);
    expect(controller.me({ sub: 'u1', role: 'BUYER' })).toEqual({ user: { sub: 'u1', role: 'BUYER' } });
  });
});
