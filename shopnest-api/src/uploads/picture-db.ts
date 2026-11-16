import { UPLOAD_NAME } from './storage.js';

// Pictures kept inside the database (table "Picture"). Used on the live server when no cloud bucket is set up.
// The short path saved on products and shops is the same as everywhere else: /uploads/<name>.webp
export type PictureRow = { data: Uint8Array | Buffer; contentType: string };
export type PictureDelegate = {
  upsert(args: { where: { name: string }; create: { name: string; data: Buffer; contentType: string }; update: { data: Buffer; contentType: string } }): Promise<unknown>;
  findUnique(args: { where: { name: string } }): Promise<PictureRow | null>;
};
export type PictureDb = {
  put(name: string, data: Buffer, contentType?: string): Promise<void>;
  get(name: string): Promise<{ data: Buffer; contentType: string } | null>;
};

export function createPictureDb(delegate: PictureDelegate): PictureDb {
  return {
    async put(name, data, contentType = 'image/webp') {
      const bytes = Buffer.from(data);
      await delegate.upsert({ where: { name }, create: { name, data: bytes, contentType }, update: { data: bytes, contentType } });
    },
    async get(name) {
      const row = await delegate.findUnique({ where: { name } });
      if (!row) return null;
      return { data: Buffer.from(row.data), contentType: row.contentType };
    },
  };
}

// Express handler for GET /uploads/<name>. Names are random, so a browser may keep a picture "forever".
export function createPictureHandler(db: PictureDb) {
  return async (req: any, res: any, next: any) => {
    if (req.method !== 'GET' && req.method !== 'HEAD') return next();
    const name = String(req.path || '').replace(/^\//, '');
    if (!UPLOAD_NAME.test(name)) {
      res.status(404).json({ statusCode: 404, message: 'Not Found' });
      return;
    }
    const etag = '"' + name + '"';
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    res.setHeader('ETag', etag);
    if (req.headers['if-none-match'] === etag) {
      res.status(304).end();
      return;
    }
    try {
      const pic = await db.get(name);
      if (!pic) {
        res.removeHeader('Cache-Control');
        res.removeHeader('ETag');
        res.status(404).json({ statusCode: 404, message: 'Not Found' });
        return;
      }
      res.setHeader('Content-Type', pic.contentType);
      res.setHeader('Content-Length', String(pic.data.length));
      res.status(200);
      if (req.method === 'HEAD') res.end();
      if (req.method !== 'HEAD') res.end(pic.data);
    } catch {
      res.removeHeader('Cache-Control');
      res.removeHeader('ETag');
      res.status(503).json({ statusCode: 503, message: 'Pictures are not available right now.' });
    }
  };
}
