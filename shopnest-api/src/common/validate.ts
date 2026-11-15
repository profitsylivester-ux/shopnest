import { BadRequestException } from '@nestjs/common';

type StrOpts = { max: number; required?: boolean; label: string };

// Returns a trimmed string, or null when the value is empty and not required.
export function str(v: unknown, o: StrOpts): string | null {
  if (v === undefined || v === null || (typeof v === 'string' && v.trim() === '')) {
    if (o.required) throw new BadRequestException(o.label + ' is required');
    return null;
  }
  if (typeof v !== 'string') throw new BadRequestException(o.label + ' must be text');
  const s = v.trim();
  if (s.length > o.max) throw new BadRequestException(o.label + ' must be at most ' + o.max + ' characters');
  return s;
}

export function bool(v: unknown, label: string): boolean {
  if (typeof v === 'boolean') return v;
  if (v === 'true') return true;
  if (v === 'false') return false;
  throw new BadRequestException(label + ' must be true or false');
}

export function int(v: unknown, label: string, min = 0, max = 100000): number {
  const n = typeof v === 'string' && v.trim() !== '' ? Number(v) : v;
  if (typeof n !== 'number' || !Number.isInteger(n) || n < min || n > max) {
    throw new BadRequestException(label + ' must be a whole number between ' + min + ' and ' + max);
  }
  return n;
}

const UPLOAD_PATH = /^\/uploads\/[0-9a-f-]{36}(-sm)?\.webp$/i;
const HTTP_URL = /^https?:\/\/[^\s]+$/i;

// A picture: an uploaded file path or a normal web address.
export function imageUrl(v: unknown, label: string, required: boolean): string | null {
  const s = str(v, { max: 500, required, label });
  if (s === null) return null;
  if (!UPLOAD_PATH.test(s) && !HTTP_URL.test(s)) throw new BadRequestException(label + ' must be an uploaded picture or a web address starting with http:// or https://');
  return s;
}

// A link: a web address or a path inside the site (such as /marketplace).
export function linkUrl(v: unknown, label: string, required: boolean): string | null {
  const s = str(v, { max: 500, required, label });
  if (s === null) return null;
  const inside = s.startsWith('/') && !s.startsWith('//') && !/\s/.test(s);
  if (!inside && !HTTP_URL.test(s)) throw new BadRequestException(label + ' must be a web address (https://...) or a path inside the site (such as /marketplace)');
  return s;
}

export function date(v: unknown, label: string): Date | null {
  if (v === undefined || v === null || v === '') return null;
  const d = new Date(String(v));
  if (isNaN(d.getTime())) throw new BadRequestException(label + ' is not a valid date');
  return d;
}

export function body(v: unknown): Record<string, unknown> {
  if (!v || typeof v !== 'object' || Array.isArray(v)) throw new BadRequestException('Request body must be an object');
  return v as Record<string, unknown>;
}

export function has(o: Record<string, unknown>, k: string) {
  return Object.prototype.hasOwnProperty.call(o, k);
}

export function paging(limit?: string, skip?: string, def = 20, max = 50) {
  const n = Math.min(Math.max(parseInt(String(limit ?? def), 10) || def, 1), max);
  const s = Math.max(parseInt(String(skip ?? '0'), 10) || 0, 0);
  return { take: n, skip: s };
}
