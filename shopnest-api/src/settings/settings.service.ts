import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { AuditService } from '../audit/audit.service.js';
import { ReqMeta } from '../audit/request-meta.js';
import { SETTING_KEYS, SETTING_RULES, cleanSettings } from './settings.keys.js';

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService, private audit: AuditService) {}

  // Public: only the settings the site understands.
  async getAll() {
    const rows = await this.prisma.setting.findMany({ where: { key: { in: SETTING_KEYS } } });
    const out: Record<string, string> = {};
    for (const r of rows) out[r.key] = r.value;
    return out;
  }

  async updateAll(data: unknown, adminId: string, meta: ReqMeta) {
    const clean = cleanSettings(data);
    const before = await this.getAll();
    const changes: { field: string; from?: string; to?: string }[] = [];
    await this.prisma.$transaction(
      Object.entries(clean).map(([key, value]) => this.prisma.setting.upsert({ where: { key }, update: { value }, create: { key, value } })),
    );
    for (const [key, value] of Object.entries(clean)) {
      const old = before[key] ?? '';
      if (old === value) continue;
      const short = SETTING_RULES[key].max <= 120 || SETTING_RULES[key].kind !== 'text';
      changes.push(short ? { field: key, from: old, to: value } : { field: key });
    }
    if (changes.length) {
      await this.audit.log({
        userId: adminId,
        actorId: adminId,
        actorRole: 'ADMIN',
        action: 'ADMIN_SETTINGS_CHANGED',
        summary: 'Changed site settings: ' + changes.map((c) => SETTING_RULES[c.field].label).join(', '),
        details: { changes },
        ...meta,
      });
    }
    return this.getAll();
  }
}
