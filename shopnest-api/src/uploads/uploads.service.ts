import { BadRequestException, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import sharp from 'sharp';
import { PrismaService } from '../prisma/prisma.service.js';
import { createPictureDb } from './picture-db.js';
import { saveFile, setPictureDb } from './storage.js';

const ALLOWED = ['jpeg', 'png', 'webp'];
const LIMITS = { limitInputPixels: 50_000_000 };

@Injectable()
export class UploadsService {
  constructor(prisma?: PrismaService) {
    if (prisma) setPictureDb(createPictureDb(prisma.picture as any));
  }

  // Reads the real file type from the content (not the file name), re-saves the picture as WebP
  // (this removes hidden data such as phone location) and makes a small thumbnail for cards.
  async saveImage(data: Buffer) {
    let full: Buffer;
    let small: Buffer;
    try {
      const meta = await sharp(data, LIMITS).metadata();
      if (!meta.format || !ALLOWED.includes(meta.format)) throw new BadRequestException('Only JPG, PNG or WebP pictures are allowed.');
      const base = sharp(data, LIMITS).rotate();
      full = await base.clone().resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true }).webp({ quality: 82 }).toBuffer();
      small = await base.clone().resize({ width: 480, height: 480, fit: 'inside', withoutEnlargement: true }).webp({ quality: 78 }).toBuffer();
    } catch (e) {
      if (e instanceof BadRequestException) throw e;
      throw new BadRequestException('This file is not a readable picture.');
    }
    const id = randomUUID();
    const url = await saveFile(id + '.webp', full);
    const thumbUrl = await saveFile(id + '-sm.webp', small);
    return { url, thumbUrl };
  }
}