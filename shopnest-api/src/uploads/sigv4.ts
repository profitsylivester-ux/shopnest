import { createHash, createHmac } from 'node:crypto';

// AWS Signature Version 4, the signing method used by Cloudflare R2, Backblaze B2 and other S3-style
// storage. Written with Node's own crypto so no extra package is needed.

export function sha256Hex(data: Buffer | string): string {
  return createHash('sha256').update(data).digest('hex');
}

function hmac(key: Buffer | string, data: string): Buffer {
  return createHmac('sha256', key).update(data).digest();
}

function encodeSegment(s: string): string {
  return encodeURIComponent(s).replace(/[!'()*]/g, (c) => '%' + c.charCodeAt(0).toString(16).toUpperCase());
}

export function canonicalPath(path: string): string {
  return path.split('/').map(encodeSegment).join('/');
}

export type SignInput = {
  method: string;
  host: string;
  path: string; // e.g. /bucket/name.webp (not yet encoded)
  query?: string; // already sorted and encoded, usually empty
  payloadHash: string;
  accessKeyId: string;
  secretAccessKey: string;
  region: string;
  service: string;
  date: Date;
};

export function amzDateOf(d: Date): string {
  return d.toISOString().replace(/[:-]|\.\d{3}/g, '');
}

export function signRequest(i: SignInput) {
  const amzDate = amzDateOf(i.date);
  const day = amzDate.slice(0, 8);
  const headers: Record<string, string> = {
    host: i.host,
    'x-amz-content-sha256': i.payloadHash,
    'x-amz-date': amzDate,
  };
  const names = Object.keys(headers).sort();
  const canonicalHeaders = names.map((n) => n + ':' + headers[n].trim() + '\n').join('');
  const signedHeaders = names.join(';');
  const canonical = [i.method.toUpperCase(), canonicalPath(i.path), i.query || '', canonicalHeaders, signedHeaders, i.payloadHash].join('\n');
  const scope = [day, i.region, i.service, 'aws4_request'].join('/');
  const toSign = ['AWS4-HMAC-SHA256', amzDate, scope, sha256Hex(canonical)].join('\n');
  const kDate = hmac('AWS4' + i.secretAccessKey, day);
  const kRegion = hmac(kDate, i.region);
  const kService = hmac(kRegion, i.service);
  const kSigning = hmac(kService, 'aws4_request');
  const signature = createHmac('sha256', kSigning).update(toSign).digest('hex');
  const authorization = 'AWS4-HMAC-SHA256 Credential=' + i.accessKeyId + '/' + scope + ', SignedHeaders=' + signedHeaders + ', Signature=' + signature;
  return { amzDate, signedHeaders, signature, authorization, canonicalRequest: canonical, headers: { ...headers, Authorization: authorization } };
}
