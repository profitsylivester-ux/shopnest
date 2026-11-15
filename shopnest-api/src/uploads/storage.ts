import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

// All picture saving lives in this one file. To move to cloud storage later (Week 4),
// only this file (and the /uploads line in main.ts) has to change.
export function uploadDir(): string {
  return process.env.UPLOAD_DIR || join(process.cwd(), 'uploads');
}

// Saves one file and returns the short path that is stored in the database.
export async function saveFile(name: string, data: Buffer): Promise<string> {
  const dir = uploadDir();
  await mkdir(dir, { recursive: true });
  await writeFile(join(dir, name), data);
  return '/uploads/' + name;
}