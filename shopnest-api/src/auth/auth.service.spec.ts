import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as bcrypt from 'bcrypt';
import { ConflictException, ForbiddenException, UnauthorizedException } from '@nestjs/common';

vi.mock('./google-token.js', () => ({
  GoogleTokenError: class GoogleTokenError extends Error {},
  verifyGoogleIdToken: vi.fn(),
}));
import { verifyGoogleIdToken } from './google-token.js';
import { AuthService } from './auth.service.js';

const meta = { ip: '41.1.2.3', userAgent: 'test' };

function make(users: any[] = []) {
  const created: any[] = [];
  const prisma: any = {
    user: {
      findUnique: async ({ where }: any) => users.find((u) => (where.email ? u.email === where.email : where.googleId ? u.googleId === where.googleId : u.id === where.id)) ?? null,
      create: async ({ data }: any) => { const u = { id: 'new1', tokenVersion: 0, ...data }; created.push(u); return u; },
    },
  };
  const jwt: any = { sign: () => 'token', signAsync: async () => 'token' };
  const logged: any[] = [];
  const audit: any = { log: async (e: any) => { logged.push(e); } };
  return { svc: new AuthService(prisma, jwt, audit), created, logged };
}

describe('AuthService', () => {
  beforeEach(() => { process.env.GOOGLE_CLIENT_ID = 'client-id'; });

  it('refuses to register an e-mail that already exists', async () => {
    const { svc } = make([{ id: 'u1', email: 'a@b.co' }]);
    await expect(svc.register({ email: 'a@b.co', password: 'password1', name: 'A' } as any, meta)).rejects.toBeInstanceOf(ConflictException);
  });

  it('registers a new account as a buyer unless a seller was asked for, and stores a hashed password', async () => {
    const { svc, created, logged } = make();
    await svc.register({ email: 'n@b.co', password: 'password1', name: 'N' } as any, meta);
    expect(created[0].role).toBe('BUYER');
    expect(created[0].password).not.toBe('password1');
    expect(await bcrypt.compare('password1', created[0].password)).toBe(true);
    expect(logged[0].action).toBe('AUTH_REGISTER');
    const s = make();
    await s.svc.register({ email: 's@b.co', password: 'password1', name: 'S', role: 'SELLER' } as any, meta);
    expect(s.created[0].role).toBe('SELLER');
  });

  it('rejects a wrong password and writes a failed-sign-in audit entry', async () => {
    const hash = await bcrypt.hash('right-pass', 4);
    const { svc, logged } = make([{ id: 'u1', email: 'a@b.co', password: hash, role: 'BUYER' }]);
    await expect(svc.login({ email: 'a@b.co', password: 'wrong-pass' } as any, meta)).rejects.toBeInstanceOf(UnauthorizedException);
    expect(logged[0].action).toBe('AUTH_LOGIN_FAILED');
    await expect(svc.login({ email: 'nobody@b.co', password: 'x' } as any, meta)).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('Google sign-in never merges into an existing password account', async () => {
    (verifyGoogleIdToken as any).mockResolvedValue({ sub: 'g1', email: 'a@b.co', name: 'A', picture: null });
    const { svc } = make([{ id: 'u1', email: 'a@b.co', password: 'h', role: 'BUYER' }]);
    await expect(svc.googleSignIn({ credential: 'x' } as any, meta)).rejects.toBeInstanceOf(ConflictException);
  });

  it('Google sign-in is not allowed for admin accounts', async () => {
    (verifyGoogleIdToken as any).mockResolvedValue({ sub: 'g9', email: 'boss@b.co', name: 'Boss', picture: null });
    const { svc } = make([{ id: 'u9', email: 'boss@b.co', googleId: 'g9', role: 'ADMIN', password: 'h' }]);
    await expect(svc.googleSignIn({ credential: 'x' } as any, meta)).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('a new Google account becomes a buyer (or a seller when asked)', async () => {
    (verifyGoogleIdToken as any).mockResolvedValue({ sub: 'g2', email: 'new@b.co', name: 'New', picture: null });
    const a = make();
    await a.svc.googleSignIn({ credential: 'x' } as any, meta);
    expect(a.created[0].role).toBe('BUYER');
    expect(a.created[0].googleId).toBe('g2');
    const b = make();
    await b.svc.googleSignIn({ credential: 'x', role: 'SELLER' } as any, meta);
    expect(b.created[0].role).toBe('SELLER');
  });
});
