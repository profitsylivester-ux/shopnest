import { sha256Hex, signRequest } from './sigv4.js';

// Cloud picture storage (Cloudflare R2, Backblaze B2 or any S3-style bucket).
// It is used only when all five settings below exist; otherwise pictures stay on this computer's disk.
export type S3Config = {
  endpoint: string; // for R2: https://<account id>.r2.cloudflarestorage.com
  bucket: string;
  accessKeyId: string;
  secretAccessKey: string;
  region: string;
  publicUrl: string; // the public web address of the bucket, without a trailing slash
};

const NAMES = ['S3_ENDPOINT', 'S3_BUCKET', 'S3_ACCESS_KEY_ID', 'S3_SECRET_ACCESS_KEY', 'S3_PUBLIC_URL'];

export function s3ConfigFromEnv(env: NodeJS.ProcessEnv = process.env): S3Config | null {
  const present = NAMES.filter((n) => !!env[n]);
  if (present.length === 0) return null;
  if (present.length !== NAMES.length) {
    const missing = NAMES.filter((n) => !env[n]);
    throw new Error('Picture storage is half set up. Missing: ' + missing.join(', '));
  }
  return {
    endpoint: (env.S3_ENDPOINT as string).replace(/\/+$/, ''),
    bucket: env.S3_BUCKET as string,
    accessKeyId: env.S3_ACCESS_KEY_ID as string,
    secretAccessKey: env.S3_SECRET_ACCESS_KEY as string,
    region: env.S3_REGION || 'auto',
    publicUrl: (env.S3_PUBLIC_URL as string).replace(/\/+$/, ''),
  };
}

type FetchLike = (url: string, init: any) => Promise<{ ok: boolean; status: number; text: () => Promise<string> }>;

export async function putObject(cfg: S3Config, key: string, body: Buffer, contentType: string, fetchImpl: FetchLike = fetch as any, now: Date = new Date()): Promise<void> {
  const url = new URL(cfg.endpoint);
  const path = '/' + cfg.bucket + '/' + key;
  const s = signRequest({
    method: 'PUT',
    host: url.host,
    path,
    payloadHash: sha256Hex(body),
    accessKeyId: cfg.accessKeyId,
    secretAccessKey: cfg.secretAccessKey,
    region: cfg.region,
    service: 's3',
    date: now,
  });
  const res = await fetchImpl(url.origin + path, {
    method: 'PUT',
    headers: { ...s.headers, 'Content-Type': contentType, 'Cache-Control': 'public, max-age=31536000, immutable' },
    body,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error('Picture storage refused the upload (' + res.status + '): ' + text.slice(0, 200));
  }
}
