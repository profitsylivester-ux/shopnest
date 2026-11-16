import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { putObject, s3ConfigFromEnv } from './s3.js';
import { cloudUrlFor, databaseMode, resetCloudConfigForTests, saveFile, setPictureDb } from './storage.js';

const CLOUD = {
  S3_ENDPOINT: 'https://abc123.r2.cloudflarestorage.com/',
  S3_BUCKET: 'shopnest-media',
  S3_ACCESS_KEY_ID: 'AKID',
  S3_SECRET_ACCESS_KEY: 'SECRET',
  S3_PUBLIC_URL: 'https://pub-xyz.r2.dev/',
};
const KEYS = [...Object.keys(CLOUD), 'S3_REGION', 'UPLOAD_DIR', 'PICTURE_STORAGE'];
const NAME = '4cc5b1e6-3502-4193-ab71-5e49bf9692d3.webp';

describe('picture storage settings', () => {
  it('is off when none of the settings exist, and on when all five exist', () => {
    expect(s3ConfigFromEnv({})).toBeNull();
    const c = s3ConfigFromEnv(CLOUD)!;
    expect(c.endpoint).toBe('https://abc123.r2.cloudflarestorage.com');
    expect(c.publicUrl).toBe('https://pub-xyz.r2.dev');
    expect(c.region).toBe('auto');
  });
  it('refuses a half set up bucket and names what is missing', () => {
    expect(() => s3ConfigFromEnv({ S3_BUCKET: 'x', S3_ENDPOINT: 'https://e' })).toThrow(/S3_ACCESS_KEY_ID/);
  });
});

describe('putObject', () => {
  it('sends a signed PUT to bucket/key with the picture bytes and cache headers', async () => {
    const cfg = s3ConfigFromEnv(CLOUD)!;
    const seen: any[] = [];
    const fake = async (url: string, init: any) => { seen.push([url, init]); return { ok: true, status: 200, text: async () => '' }; };
    await putObject(cfg, NAME, Buffer.from('abc'), 'image/webp', fake as any, new Date(Date.UTC(2026, 10, 16, 6, 0, 0)));
    expect(seen[0][0]).toBe('https://abc123.r2.cloudflarestorage.com/shopnest-media/' + NAME);
    expect(seen[0][1].method).toBe('PUT');
    expect(seen[0][1].headers.Authorization).toMatch(/^AWS4-HMAC-SHA256 Credential=AKID\/20261116\/auto\/s3\/aws4_request, SignedHeaders=host;x-amz-content-sha256;x-amz-date, Signature=[0-9a-f]{64}$/);
    expect(seen[0][1].headers['Content-Type']).toBe('image/webp');
    expect(seen[0][1].headers['Cache-Control']).toContain('immutable');
    expect(Buffer.from(seen[0][1].body).toString()).toBe('abc');
  });
  it('turns a refusal from the bucket into a clear error', async () => {
    const cfg = s3ConfigFromEnv(CLOUD)!;
    const fake = async () => ({ ok: false, status: 403, text: async () => 'SignatureDoesNotMatch' });
    await expect(putObject(cfg, NAME, Buffer.from('a'), 'image/webp', fake as any)).rejects.toThrow(/403/);
  });
});

describe('saveFile', () => {
  let dir: string;
  const saved: Record<string, string | undefined> = {};
  beforeEach(async () => {
    for (const k of KEYS) { saved[k] = process.env[k]; delete process.env[k]; }
    dir = await mkdtemp(join(tmpdir(), 'sn-up-'));
    resetCloudConfigForTests();
  });
  afterEach(async () => {
    for (const k of KEYS) { if (saved[k] === undefined) delete process.env[k]; else process.env[k] = saved[k]; }
    resetCloudConfigForTests();
    vi.unstubAllGlobals();
    await rm(dir, { recursive: true, force: true });
  });

  it('writes to the uploads folder when no cloud bucket is set, and returns the short path', async () => {
    process.env.UPLOAD_DIR = dir;
    const p = await saveFile(NAME, Buffer.from('local-bytes'));
    expect(p).toBe('/uploads/' + NAME);
    expect((await readFile(join(dir, NAME))).toString()).toBe('local-bytes');
    expect(cloudUrlFor(NAME)).toBeNull();
  });

  it('uploads to the bucket (and not to disk) when the five settings exist, returning the same short path', async () => {
    Object.assign(process.env, CLOUD, { UPLOAD_DIR: dir });
    resetCloudConfigForTests();
    const calls: string[] = [];
    vi.stubGlobal('fetch', async (url: string) => { calls.push(url); return { ok: true, status: 200, text: async () => '' }; });
    const p = await saveFile(NAME, Buffer.from('x'));
    expect(p).toBe('/uploads/' + NAME);
    expect(calls).toEqual(['https://abc123.r2.cloudflarestorage.com/shopnest-media/' + NAME]);
    await expect(readFile(join(dir, NAME))).rejects.toThrow();
    expect(cloudUrlFor(NAME)).toBe('https://pub-xyz.r2.dev/' + NAME);
    expect(cloudUrlFor('../../etc/passwd')).toBeNull();
  });

  it('keeps pictures in the database (and not on disk) when PICTURE_STORAGE=database', async () => {
    Object.assign(process.env, { PICTURE_STORAGE: 'database', UPLOAD_DIR: dir });
    resetCloudConfigForTests();
    const put: any[] = [];
    setPictureDb({ put: async (n, d, c) => { put.push([n, d.toString(), c]); }, get: async () => null });
    expect(databaseMode()).toBe(true);
    const p = await saveFile(NAME, Buffer.from('db-bytes'));
    expect(p).toBe('/uploads/' + NAME);
    expect(put).toEqual([[NAME, 'db-bytes', 'image/webp']]);
    await expect(readFile(join(dir, NAME))).rejects.toThrow();
    setPictureDb(null);
    await expect(saveFile(NAME, Buffer.from('x'))).rejects.toThrow(/not ready/);
  });

  it('a complete cloud bucket wins over the database setting, and the setting is off by default', async () => {
    expect(databaseMode()).toBe(false);
    Object.assign(process.env, CLOUD, { PICTURE_STORAGE: 'database' });
    expect(databaseMode()).toBe(false);
  });
});
