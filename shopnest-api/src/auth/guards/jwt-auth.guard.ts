import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service.js';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService, private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const authHeader: string | undefined = req.headers?.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid Authorization header');
    }
    const token = authHeader.slice(7).trim();
    let payload: any;
    try {
      payload = await this.jwtService.verifyAsync(token);
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
    // "Sign out of all devices" raises tokenVersion; older tokens no longer match.
    const row = await this.prisma.user.findUnique({ where: { id: String(payload?.sub ?? '') }, select: { tokenVersion: true } });
    if (!row || (payload.tv ?? 0) !== row.tokenVersion) {
      throw new UnauthorizedException('Session ended. Please sign in again.');
    }
    req.user = payload;
    return true;
  }
}
