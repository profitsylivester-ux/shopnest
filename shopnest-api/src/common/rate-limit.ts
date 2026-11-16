// A small safety net in front of the whole API: one visitor address may only make so many requests per
// minute. The stricter limits on sign in, sign up and reviews stay as they are; this stops floods.
// It lives in memory, which is right while the API runs as one instance.

type Hit = { count: number; reset: number };

export type RateLimitOptions = {
  windowMs: number;
  max: number;
  skip?: (req: any) => boolean;
  now?: () => number;
};

export function createRateLimiter(o: RateLimitOptions) {
  const hits = new Map<string, Hit>();
  const now = o.now ?? (() => Date.now());
  let lastSweep = now();

  function sweep(t: number) {
    if (t - lastSweep < o.windowMs && hits.size < 10000) return;
    lastSweep = t;
    for (const [k, v] of hits) if (v.reset <= t) hits.delete(k);
  }

  const middleware = (req: any, res: any, next: () => void) => {
    if (o.skip && o.skip(req)) return next();
    const t = now();
    sweep(t);
    const key = String(req.ip || 'unknown');
    let h = hits.get(key);
    if (!h || h.reset <= t) {
      h = { count: 0, reset: t + o.windowMs };
      hits.set(key, h);
    }
    h.count += 1;
    if (h.count > o.max) {
      res.setHeader('Retry-After', String(Math.max(1, Math.ceil((h.reset - t) / 1000))));
      res.status(429).json({ statusCode: 429, message: 'Too many requests. Please slow down and try again in a minute.' });
      return;
    }
    next();
  };
  (middleware as any).size = () => hits.size;
  return middleware as typeof middleware & { size: () => number };
}
