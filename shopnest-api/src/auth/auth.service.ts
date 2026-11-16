import { randomBytes } from 'node:crypto';
import { BadRequestException, ConflictException, ForbiddenException, Injectable, ServiceUnavailableException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RegisterDto, LoginDto, GoogleDto, ChangePasswordDto, ChangeEmailDto } from './dto/auth.dto.js';
import { GoogleTokenError, verifyGoogleIdToken } from './google-token.js';
import { AuditService } from '../audit/audit.service.js';
import type { ReqMeta } from '../audit/request-meta.js';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private audit: AuditService,
  ) {}

  async register(dto: RegisterDto, meta: ReqMeta) {
    const existingUser = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existingUser) throw new ConflictException('Email already exists');
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: { email: dto.email, password: hashedPassword, name: dto.name, role: dto.role === 'SELLER' ? 'SELLER' : 'BUYER' },
    });
    await this.audit.log({ userId: user.id, action: 'AUTH_REGISTER', summary: 'Account created as ' + (user.role === 'SELLER' ? 'a seller' : 'a buyer'), ...meta });
    return this.signToken(user);
  }

  async login(dto: LoginDto, meta: ReqMeta) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) throw new UnauthorizedException('Invalid credentials');
    const isMatch = await bcrypt.compare(dto.password, user.password);
    if (!isMatch) {
      await this.audit.log({ userId: user.id, action: 'AUTH_LOGIN_FAILED', summary: 'Failed sign-in attempt (wrong password)', ...meta });
      throw new UnauthorizedException('Invalid credentials');
    }
    await this.audit.log({ userId: user.id, action: 'AUTH_LOGIN', summary: 'Signed in', ...meta });
    return this.signToken(user);
  }

  // "Continue with Google". Google proves the email is real; we never see a Google password.
  async googleSignIn(dto: GoogleDto, meta: ReqMeta) {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId) throw new ServiceUnavailableException('Google sign-in is not set up yet.');
    let profile;
    try {
      profile = await verifyGoogleIdToken(dto.credential, clientId);
    } catch (e) {
      if (e instanceof GoogleTokenError) throw new UnauthorizedException('Google sign-in could not be verified. Please try again.');
      throw new ServiceUnavailableException('Could not reach Google to check your sign-in. Please try again.');
    }
    const byGoogle = await this.prisma.user.findUnique({ where: { googleId: profile.sub } });
    if (byGoogle) {
      if (byGoogle.role === 'ADMIN') throw new ForbiddenException('Admin accounts must sign in with email and password.');
      await this.audit.log({ userId: byGoogle.id, action: 'AUTH_LOGIN', summary: 'Signed in with Google', ...meta });
      return this.signToken(byGoogle);
    }
    const sameEmail = await this.prisma.user.findUnique({ where: { email: profile.email } });
    if (sameEmail) {
      // We do not merge accounts automatically: someone could have registered this email by password before its real owner.
      throw new ConflictException('An account with this email already exists. Please sign in with your email and password.');
    }
    const user = await this.prisma.user.create({
      data: {
        email: profile.email,
        name: profile.name,
        googleId: profile.sub,
        password: await bcrypt.hash(randomBytes(32).toString('hex'), 10),
        role: dto.role === 'SELLER' ? 'SELLER' : 'BUYER',
      },
    });
    await this.audit.log({ userId: user.id, action: 'AUTH_REGISTER', summary: 'Account created with Google as ' + (user.role === 'SELLER' ? 'a seller' : 'a buyer'), ...meta });
    return this.signToken(user);
  }

  async logout(userId: string, meta: ReqMeta) {
    await this.audit.log({ userId, action: 'AUTH_LOGOUT', summary: 'Signed out', ...meta });
    return { ok: true };
  }

  async account(userId: string) {
    const u = await this.prisma.user.findUnique({ where: { id: userId }, select: { id: true, email: true, name: true, role: true, createdAt: true } });
    if (!u) throw new UnauthorizedException('Account not found');
    return u;
  }

  async updateName(userId: string, name: string, meta: ReqMeta) {
    const clean = name.trim();
    if (clean.length < 1 || clean.length > 80) throw new BadRequestException('Name must be 1 to 80 characters');
    const u = await this.prisma.user.findUnique({ where: { id: userId }, select: { name: true } });
    if (!u) throw new UnauthorizedException('Account not found');
    if (u.name === clean) return { name: clean };
    await this.prisma.user.update({ where: { id: userId }, data: { name: clean } });
    await this.audit.log({ userId, action: 'AUTH_NAME_CHANGED', summary: 'Display name changed from "' + u.name + '" to "' + clean + '"', details: { changes: [{ field: 'name', from: u.name, to: clean }] }, ...meta });
    return { name: clean };
  }

  async changePassword(userId: string, dto: ChangePasswordDto, meta: ReqMeta) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('Account not found');
    if (user.googleId) throw new BadRequestException('This account signs in with Google, so it has no password to change.');
    if (!(await bcrypt.compare(dto.currentPassword, user.password))) {
      await this.audit.log({ userId, action: 'AUTH_PASSWORD_CHANGE_FAILED', summary: 'Password change refused (wrong current password)', ...meta });
      throw new BadRequestException('Current password is incorrect');
    }
    if (dto.newPassword === dto.currentPassword) throw new BadRequestException('New password must be different');
    const hashed = await bcrypt.hash(dto.newPassword, 10);
    const updated = await this.prisma.user.update({ where: { id: userId }, data: { password: hashed, tokenVersion: { increment: 1 } } });
    await this.audit.log({ userId, action: 'AUTH_PASSWORD_CHANGED', summary: 'Password changed. Other devices were signed out.', ...meta });
    return this.signToken(updated);
  }

  async changeEmail(userId: string, dto: ChangeEmailDto, meta: ReqMeta) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('Account not found');
    if (!(await bcrypt.compare(dto.password, user.password))) {
      await this.audit.log({ userId, action: 'AUTH_EMAIL_CHANGE_FAILED', summary: 'Email change refused (wrong password)', ...meta });
      throw new BadRequestException('Password is incorrect');
    }
    const next = dto.newEmail.trim();
    if (next === user.email) throw new BadRequestException('That is already your email');
    const taken = await this.prisma.user.findUnique({ where: { email: next } });
    if (taken) throw new ConflictException('Email already exists');
    const updated = await this.prisma.user.update({ where: { id: userId }, data: { email: next, tokenVersion: { increment: 1 } } });
    await this.audit.log({ userId, action: 'AUTH_EMAIL_CHANGED', summary: 'Email changed from ' + user.email + ' to ' + next + '. Other devices were signed out.', details: { changes: [{ field: 'email', from: user.email, to: next }] }, ...meta });
    return this.signToken(updated);
  }

  async logoutAll(userId: string, meta: ReqMeta) {
    const updated = await this.prisma.user.update({ where: { id: userId }, data: { tokenVersion: { increment: 1 } } });
    await this.audit.log({ userId, action: 'AUTH_LOGOUT_ALL', summary: 'Signed out of all devices (this device stays signed in)', ...meta });
    return this.signToken(updated);
  }

  private async signToken(user: { id: string; email: string; role: string; name: string; tokenVersion: number }) {
    const payload = { sub: user.id, email: user.email, role: user.role, tv: user.tokenVersion };
    return {
      access_token: await this.jwtService.signAsync(payload),
      user: { id: user.id, email: user.email, role: user.role, name: user.name },
    };
  }
}
