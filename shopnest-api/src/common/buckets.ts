export type Gran = 'hour' | 'day' | 'month';

// Tanzania is UTC+3 all year (no daylight saving), so buckets follow local time.
const TZ_OFFSET_MS = 3 * 60 * 60 * 1000;
const HOUR = 60 * 60 * 1000;
const KEY_LENGTH: Record<Gran, number> = { hour: 13, day: 10, month: 7 };
export const SQL_FORMAT: Record<Gran, string> = { hour: 'YYYY-MM-DD"T"HH24', day: 'YYYY-MM-DD', month: 'YYYY-MM' };
export const PERIODS: Record<string, { ms: number | null; g: Gran }> = {
  day: { ms: 24 * HOUR, g: 'hour' },
  week: { ms: 7 * 24 * HOUR, g: 'day' },
  month: { ms: 30 * 24 * HOUR, g: 'day' },
  year: { ms: 365 * 24 * HOUR, g: 'month' },
  all: { ms: null, g: 'month' },
};

const shift = (d: Date) => new Date(d.getTime() + TZ_OFFSET_MS);
export const bucketKey = (d: Date, g: Gran) => shift(d).toISOString().slice(0, KEY_LENGTH[g]);

export function bucketKeys(since: Date, now: Date, g: Gran) {
  const keys: string[] = [];
  const end = bucketKey(now, g);
  const cur = shift(since);
  if (g === 'hour') cur.setUTCMinutes(0, 0, 0);
  else if (g === 'day') cur.setUTCHours(0, 0, 0, 0);
  else {
    cur.setUTCDate(1);
    cur.setUTCHours(0, 0, 0, 0);
  }
  for (let i = 0; i < 1000; i++) {
    const k = cur.toISOString().slice(0, KEY_LENGTH[g]);
    keys.push(k);
    if (k >= end) break;
    if (g === 'hour') cur.setUTCHours(cur.getUTCHours() + 1);
    else if (g === 'day') cur.setUTCDate(cur.getUTCDate() + 1);
    else cur.setUTCMonth(cur.getUTCMonth() + 1);
  }
  return keys;
}
