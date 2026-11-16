import { describe, it, expect } from 'vitest';
import { amzDateOf, canonicalPath, sha256Hex, signRequest } from './sigv4.js';

describe('AWS Signature V4 signing', () => {
  it('gives exactly the signature the official AWS library (botocore) gives for the same upload', () => {
    // Vector made with botocore S3SigV4Auth for the same request, keys and time.
    const body = Buffer.from('hello webp bytes');
    expect(sha256Hex(body)).toBe('c21cac660a98b4f557aed94aed1af7d510b7c035fd360744e3de5be60ed24bba');
    const s = signRequest({
      method: 'PUT',
      host: 'abc123.r2.cloudflarestorage.com',
      path: '/shopnest-media/4cc5b1e6-3502-4193-ab71-5e49bf9692d3.webp',
      payloadHash: sha256Hex(body),
      accessKeyId: 'AKIDEXAMPLE',
      secretAccessKey: 'wJalrXUtnFEMI/K7MDENG+bPxRfiCYEXAMPLEKEY',
      region: 'auto',
      service: 's3',
      date: new Date(Date.UTC(2026, 10, 16, 6, 11, 54)),
    });
    expect(s.amzDate).toBe('20261116T061154Z');
    expect(s.signedHeaders).toBe('host;x-amz-content-sha256;x-amz-date');
    expect(s.signature).toBe('c1d29c665d37fa7b637940301527d963e1654c8c78c2c9a997fc9859bb585550');
    expect(s.authorization).toContain('Credential=AKIDEXAMPLE/20261116/auto/s3/aws4_request');
  });
  it('formats the date the way AWS wants it', () => {
    expect(amzDateOf(new Date(Date.UTC(2026, 0, 2, 3, 4, 5, 678)))).toBe('20260102T030405Z');
  });
  it('encodes unusual characters in a path', () => {
    expect(canonicalPath('/b/a b(1).webp')).toBe('/b/a%20b%281%29.webp');
  });
});
