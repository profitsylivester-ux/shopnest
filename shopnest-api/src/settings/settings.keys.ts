import { BadRequestException } from '@nestjs/common';

type Rule = { label: string; max: number; kind: 'text' | 'bool' | 'media' };

// The only settings the site understands. Anything else is refused.
export const SETTING_RULES: Record<string, Rule> = {
  announcementActive: { label: 'Announcement bar switch', max: 5, kind: 'bool' },
  announcementText: { label: 'Announcement text', max: 200, kind: 'text' },
  heroTitle: { label: 'Marketplace title', max: 120, kind: 'text' },
  heroSubtitle: { label: 'Marketplace subtitle', max: 250, kind: 'text' },
  slide1Title: { label: 'Home headline', max: 120, kind: 'text' },
  slide1Desc: { label: 'Home description', max: 300, kind: 'text' },
  slide1Video: { label: 'Home background video', max: 300, kind: 'media' },
  reviewsRequireApproval: { label: 'Review approval switch', max: 5, kind: 'bool' },
  // kept so an old saved value is not rejected; the home page does not use it
  slide3Bg: { label: 'Slide 3 background', max: 500, kind: 'media' },
};

export const SETTING_KEYS = Object.keys(SETTING_RULES);
const MEDIA = /^(\/[A-Za-z0-9._\-\/]+|\/uploads\/[0-9a-f-]{36}(-sm)?\.webp|https?:\/\/[^\s]+)$/i;

// Returns clean string values for every key, or throws a message the admin can read.
export function cleanSettings(input: unknown): Record<string, string> {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new BadRequestException('Settings must be an object');
  const out: Record<string, string> = {};
  const unknown: string[] = [];
  for (const [key, raw] of Object.entries(input as Record<string, unknown>)) {
    if (!Object.prototype.hasOwnProperty.call(SETTING_RULES, key)) {
      unknown.push(key);
      continue;
    }
    const rule = SETTING_RULES[key];
    if (typeof raw !== 'string' && typeof raw !== 'boolean') throw new BadRequestException(rule.label + ' must be text');
    const value = typeof raw === 'boolean' ? String(raw) : raw.trim();
    if (value.length > rule.max) throw new BadRequestException(rule.label + ' must be at most ' + rule.max + ' characters');
    if (rule.kind === 'bool' && value !== 'true' && value !== 'false') throw new BadRequestException(rule.label + ' must be on or off');
    if (rule.kind === 'media' && value !== '' && !MEDIA.test(value)) throw new BadRequestException(rule.label + ' must be a file path such as /video.mp4, an uploaded file, or a web address starting with https://');
    out[key] = value;
  }
  if (unknown.length) throw new BadRequestException('Unknown setting: ' + unknown.slice(0, 5).join(', '));
  return out;
}
