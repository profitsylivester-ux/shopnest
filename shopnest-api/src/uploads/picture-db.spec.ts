import { describe, it, expect } from 'vitest';
import { createPictureDb, createPictureHandler } from './picture-db.js';

const NAME = '4cc5b1e6-3502-4193-ab71-5e49bf9692d3.webp';

function fakeDelegate() {
  const rows = new Map<string, { data: Buffer; contentType: string }>();
  return {
    rows,
    async upsert(a: any) { rows.set(a.where.name, { data: rows.has(a.where.name) ? a.update.data : a.create.data, contentType: a.create.contentType }); return {}; },
    async findUnique(a: any) { return rows.get(a.where.name) ?? null; },
  };
}

function run(handler: any, method: string, path: string, headers: Record<string, string> = {}) {
  return new Promise<any>((resolve) => {
    const out: any = { status: 200, headers: {} as Record<string, string>, body: undefined, nextCalled: false };
    const res: any = {
      setHeader: (k: string, v: string) => { out.headers[k.toLowerCase()] = v; },
      removeHeader: (k: string) => { delete out.headers[k.toLowerCase()]; },
      status: (n: number) => { out.status = n; return res; },
      json: (b: any) => { out.body = b; resolve(out); return res; },
      end: (b?: any) => { out.body = b; resolve(out); return res; },
    };
    handler({ method, path, headers }, res, () => { out.nextCalled = true; resolve(out); });
  });
}

describe('picture database', () => {
  it('stores a picture and reads the same bytes back, replacing it when saved again', async () => {
    const d = fakeDelegate();
    const db = createPictureDb(d as any);
    await db.put(NAME, Buffer.from('one'));
    expect((await db.get(NAME))!.data.toString()).toBe('one');
    expect((await db.get(NAME))!.contentType).toBe('image/webp');
    await db.put(NAME, Buffer.from('two'));
    expect((await db.get(NAME))!.data.toString()).toBe('two');
    expect(await db.get('00000000-0000-0000-0000-000000000000.webp')).toBeNull();
  });
});

describe('GET /uploads handler', () => {
  const make = async () => {
    const d = fakeDelegate();
    const db = createPictureDb(d as any);
    await db.put(NAME, Buffer.from('PIC'));
    return createPictureHandler(db);
  };
  it('sends the picture with a one-year cache and an ETag', async () => {
    const r = await run(await make(), 'GET', '/' + NAME);
    expect(r.status).toBe(200);
    expect(r.body.toString()).toBe('PIC');
    expect(r.headers['content-type']).toBe('image/webp');
    expect(r.headers['cache-control']).toBe('public, max-age=31536000, immutable');
    expect(r.headers['content-length']).toBe('3');
    expect(r.headers['etag']).toBe('"' + NAME + '"');
  });
  it('answers 304 without reading the database when the browser already has it', async () => {
    let reads = 0;
    const h = createPictureHandler({ put: async () => {}, get: async () => { reads++; return null; } });
    const r = await run(h, 'GET', '/' + NAME, { 'if-none-match': '"' + NAME + '"' });
    expect(r.status).toBe(304);
    expect(reads).toBe(0);
  });
  it('HEAD sends headers only', async () => {
    const r = await run(await make(), 'HEAD', '/' + NAME);
    expect(r.status).toBe(200);
    expect(r.body).toBeUndefined();
    expect(r.headers['content-length']).toBe('3');
  });
  it('404 for an unknown picture (and no long cache), 404 for names that are not picture names', async () => {
    const h = await make();
    const a = await run(h, 'GET', '/00000000-0000-0000-0000-000000000000.webp');
    expect(a.status).toBe(404);
    expect(a.headers['cache-control']).toBeUndefined();
    for (const bad of ['/', '/../../etc/passwd', '/abc.webp', '/' + NAME + '.exe']) expect((await run(h, 'GET', bad)).status).toBe(404);
  });
  it('lets other methods pass on, and answers 503 (not a crash) when the database fails', async () => {
    const h = createPictureHandler({ put: async () => {}, get: async () => { throw new Error('db down'); } });
    expect((await run(h, 'POST', '/' + NAME)).nextCalled).toBe(true);
    const r = await run(h, 'GET', '/' + NAME);
    expect(r.status).toBe(503);
    expect(r.headers['cache-control']).toBeUndefined();
  });
});
