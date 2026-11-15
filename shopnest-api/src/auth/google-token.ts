import { createPublicKey, createVerify } from 'node:crypto';

// Checks a "Sign in with Google" token on the server, using only Node itself:
// the signature is verified against Google's public keys, and the token must be for OUR app,
// from Google, not expired, with an email Google has verified.

const CERTS_URL = 'https://www.googleapis.com/oauth2/v3/certs';
const ISSUERS = ['https://accounts.google.com', 'accounts.google.com'];
const SKEW_SECONDS = 60;

export type Jwk = { kid: string; kty: string; n: string; e: string; alg?: string };
export type GoogleProfile = { sub: string; email: string; name: string; picture: string | null };
export type VerifyOptions = { fetchKeys?: () => Promise<Jwk[]>; nowSeconds?: number };

export class GoogleTokenError extends Error {}

let cache: { keys: Jwk[]; until: number } | null = null;

async function fetchGoogleKeys(): Promise<Jwk[]> {
  if (cache && cache.until > Date.now()) return cache.keys;
  const res = await fetch(CERTS_URL);
  if (!res.ok) throw new GoogleTokenError('Could not load Google keys');
  const body = (await res.json()) as { keys?: Jwk[] };
  const keys = Array.isArray(body.keys) ? body.keys : [];
  const m = /max-age=(\d+)/.exec(res.headers.get('cache-control') || '');
  const ttl = m ? Math.min(Number(m[1]), 3600) : 600;
  cache = { keys, until: Date.now() + ttl * 1000 };
  return keys;
}

function b64urlJson(part: string): any {
  try {
    return JSON.parse(Buffer.from(part, 'base64url').toString('utf8'));
  } catch {
    throw new GoogleTokenError('Malformed token');
  }
}

export async function verifyGoogleIdToken(idToken: string, clientId: string, opts: VerifyOptions = {}): Promise<GoogleProfile> {
  if (typeof idToken !== 'string' || idToken.length > 4096) throw new GoogleTokenError('Malformed token');
  const parts = idToken.split('.');
  if (parts.length !== 3 || parts.some((p) => p === '')) throw new GoogleTokenError('Malformed token');
  const header = b64urlJson(parts[0]);
  const payload = b64urlJson(parts[1]);
  if (header.alg !== 'RS256' || typeof header.kid !== 'string') throw new GoogleTokenError('Unsupported token');

  const getKeys = opts.fetchKeys ?? fetchGoogleKeys;
  let key = (await getKeys()).find((k) => k.kid === header.kid);
  if (!key && !opts.fetchKeys) {
    cache = null;
    key = (await getKeys()).find((k) => k.kid === header.kid);
  }
  if (!key) throw new GoogleTokenError('Unknown signing key');

  const verifier = createVerify('RSA-SHA256');
  verifier.update(parts[0] + '.' + parts[1]);
  let good = false;
  try {
    good = verifier.verify(createPublicKey({ key: key as any, format: 'jwk' }), Buffer.from(parts[2], 'base64url'));
  } catch {
    good = false;
  }
  if (!good) throw new GoogleTokenError('Bad signature');

  const now = opts.nowSeconds ?? Math.floor(Date.now() / 1000);
  if (!ISSUERS.includes(payload.iss)) throw new GoogleTokenError('Wrong issuer');
  const aud = payload.aud;
  if (aud !== clientId) throw new GoogleTokenError('Token is for a different app');
  if (typeof payload.exp !== 'number' || payload.exp < now - SKEW_SECONDS) throw new GoogleTokenError('Token expired');
  if (typeof payload.iat === 'number' && payload.iat > now + SKEW_SECONDS) throw new GoogleTokenError('Token not valid yet');
  if (typeof payload.sub !== 'string' || payload.sub === '') throw new GoogleTokenError('Missing account id');
  if (typeof payload.email !== 'string' || payload.email === '') throw new GoogleTokenError('Missing email');
  if (payload.email_verified !== true && payload.email_verified !== 'true') throw new GoogleTokenError('Google has not verified this email');

  const email = payload.email.trim().toLowerCase();
  const name = typeof payload.name === 'string' && payload.name.trim() ? payload.name.trim().slice(0, 80) : email.split('@')[0];
  return { sub: payload.sub, email, name, picture: typeof payload.picture === 'string' ? payload.picture : null };
}
