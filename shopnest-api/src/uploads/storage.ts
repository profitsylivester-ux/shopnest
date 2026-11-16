import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { putObject, s3ConfigFromEnv, type S3Config } from './s3.js';

// All picture saving lives in this one file.
// - On your computer: files go to the uploads folder.
// - On the live server: set the five S3_* settings and files go to the cloud bucket instead.
// Either way, the short path saved in the database is the same: /uploads/<name>.webp
export function uploadDir(): string {
  return process.env.UPLOAD_DIR || join(process.cwd(), 'uploads');
}

let cached: S3Config | null | undefined;
export function cloudConfig(): S3Config | null {
  if (cached === undefined) cached = s3ConfigFromEnv();
  return cached;
}
export function resetCloudConfigForTests() {
  cached = undefined;
}

export const UPLOAD_NAME = /^[0-9a-f-]{36}(-sm)?\.webp$/i;

// Saves one file and returns the short path that is stored in the database.
export async function saveFile(name: string, data: Buffer): Promise<string> {
  const cloud = cloudConfig();
  if (cloud) {
    await putObject(cloud, name, data, 'image/webp');
    return '/uploads/' + name;
  }
  const dir = uploadDir();
  await mkdir(dir, { recursive: true });
  await writeFile(join(dir, name), data);
  return '/uploads/' + name;
}

// Where a stored picture can be fetched from when the cloud bucket is used.
export function cloudUrlFor(name: string): string | null {
  const cloud = cloudConfig();
  if (!cloud || !UPLOAD_NAME.test(name)) return null;
  return cloud.publicUrl + '/' + name;
}
