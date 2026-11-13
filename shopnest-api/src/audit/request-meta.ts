export type ReqMeta = { ip: string | null; userAgent: string | null };

export function reqMeta(req: any): ReqMeta {
  const ip = typeof req?.ip === 'string' ? req.ip.replace(/^::ffff:/, '') : null;
  const ua = String(req?.headers?.['user-agent'] ?? '').slice(0, 300);
  return { ip, userAgent: ua || null };
}
