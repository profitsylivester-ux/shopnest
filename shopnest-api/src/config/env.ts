// All settings that change between your computer and the live server are read here, from the environment.
// Nothing about addresses is written into the code any more.

export function isProduction(env: NodeJS.ProcessEnv = process.env): boolean {
  return env.NODE_ENV === 'production';
}

// The website addresses that may call this API (comma separated), for example
// FRONTEND_ORIGINS=https://shopnest-web.onrender.com
export function frontendOrigins(env: NodeJS.ProcessEnv = process.env): string[] {
  const raw = env.FRONTEND_ORIGINS || 'http://localhost:3000';
  return raw
    .split(',')
    .map((s) => s.trim().replace(/\/+$/, ''))
    .filter((s) => s.length > 0);
}

export function listenPort(env: NodeJS.ProcessEnv = process.env): number {
  const n = Number(env.PORT);
  return Number.isInteger(n) && n > 0 && n < 65536 ? n : 3001;
}

// How many proxies stand in front of the API (a host such as Render is 1). 0 = none (your computer).
// This is what makes the audit log and the rate limits see each visitor's real address.
export function trustProxyHops(env: NodeJS.ProcessEnv = process.env): number {
  const n = Number(env.TRUST_PROXY);
  return Number.isInteger(n) && n >= 0 && n <= 5 ? n : 0;
}

// Biggest JSON body the API accepts. Pictures travel as real files now, so this can be small.
export function jsonLimit(env: NodeJS.ProcessEnv = process.env): string {
  return /^\d+(kb|mb)$/i.test(env.JSON_LIMIT || '') ? (env.JSON_LIMIT as string).toLowerCase() : '2mb';
}

// Requests one visitor address may make per minute across the whole API.
export function rateLimitPerMinute(env: NodeJS.ProcessEnv = process.env): number {
  const n = Number(env.RATE_LIMIT_PER_MIN);
  return Number.isInteger(n) && n >= 30 && n <= 100000 ? n : 600;
}

// On the live server, stop at start-up (with a clear message) instead of running half set up.
export function checkRequiredEnv(env: NodeJS.ProcessEnv = process.env): string[] {
  const problems: string[] = [];
  if (!isProduction(env)) return problems;
  if (!env.DATABASE_URL) problems.push('DATABASE_URL is missing');
  if (!env.JWT_SECRET || env.JWT_SECRET.length < 32) problems.push('JWT_SECRET is missing or shorter than 32 characters');
  if (!env.FRONTEND_ORIGINS) problems.push('FRONTEND_ORIGINS is missing (the website address that may call this API)');
  // pictures need a home that survives restarts: the database or a cloud bucket (never the host's temporary disk)
  const bucketNames = ['S3_ENDPOINT', 'S3_BUCKET', 'S3_ACCESS_KEY_ID', 'S3_SECRET_ACCESS_KEY', 'S3_PUBLIC_URL'];
  const bucketSet = bucketNames.filter((n) => !!env[n]).length;
  if (bucketSet === 0 && env.PICTURE_STORAGE !== 'database') problems.push('Pictures have no safe home: set PICTURE_STORAGE=database (or all five S3_* bucket settings)');
  if (env.PICTURE_STORAGE && env.PICTURE_STORAGE !== 'database') problems.push('PICTURE_STORAGE must be exactly: database');
  return problems;
}
