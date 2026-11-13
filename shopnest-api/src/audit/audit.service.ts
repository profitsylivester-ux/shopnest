import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

export type AuditInput = {
  userId: string;
  actorId?: string;
  actorRole?: string;
  action: string;
  summary: string;
  details?: Record<string, unknown> | null;
  ip?: string | null;
  userAgent?: string | null;
};

const CATEGORY_PREFIX: Record<string, string> = { security: 'AUTH_', shop: 'STORE_', products: 'PRODUCT_', admin: 'ADMIN_' };

function scrub(v: unknown, depth = 0): unknown {
  if (v === null || v === undefined) return v;
  if (typeof v === 'string') {
    if (v.startsWith('data:')) return '[image]';
    return v.length > 200 ? v.slice(0, 200) + '...' : v;
  }
  if (typeof v === 'number' || typeof v === 'boolean') return v;
  if (depth > 4) return null;
  if (Array.isArray(v)) return v.slice(0, 30).map((x) => scrub(x, depth + 1));
  if (typeof v === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, val] of Object.entries(v as Record<string, unknown>)) {
      if (/pass|token|secret/i.test(k)) continue;
      out[k] = scrub(val, depth + 1);
    }
    return out;
  }
  return null;
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger('Audit');
  constructor(private prisma: PrismaService) {}

  // Never throws: a logging problem must not break the action being logged.
  async log(e: AuditInput): Promise<void> {
    try {
      await this.prisma.auditLog.create({
        data: {
          userId: e.userId,
          actorId: e.actorId ?? e.userId,
          actorRole: e.actorRole ?? 'SELF',
          action: e.action,
          summary: e.summary.slice(0, 300),
          details: e.details ? (scrub(e.details) as any) : undefined,
          ip: e.ip ?? null,
          userAgent: e.userAgent ?? null,
        },
      });
    } catch (err: any) {
      this.logger.warn('Could not write audit entry ' + e.action + ': ' + (err?.message ?? err));
    }
  }

  async list(userId: string, limit?: string, skip?: string, category?: string) {
    const n = Math.min(Math.max(parseInt(String(limit ?? '20'), 10) || 20, 1), 50);
    const s = Math.max(parseInt(String(skip ?? '0'), 10) || 0, 0);
    const prefix = typeof category === 'string' && Object.prototype.hasOwnProperty.call(CATEGORY_PREFIX, category) ? CATEGORY_PREFIX[category] : null;
    const where = { userId, ...(prefix ? { action: { startsWith: prefix } } : {}) };
    const [total, rows] = await Promise.all([
      this.prisma.auditLog.count({ where }),
      this.prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: s,
        take: n,
        select: { id: true, action: true, summary: true, details: true, ip: true, userAgent: true, actorId: true, actorRole: true, createdAt: true },
      }),
    ]);
    return {
      total,
      items: rows.map((r) => ({
        id: r.id,
        action: r.action,
        summary: r.summary,
        details: r.details,
        ip: r.ip,
        userAgent: r.userAgent,
        byAdmin: r.actorId !== userId && r.actorRole === 'ADMIN',
        createdAt: r.createdAt,
      })),
    };
  }
}
