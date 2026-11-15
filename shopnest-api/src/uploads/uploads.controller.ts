import { BadRequestException, Controller, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { UploadsService } from './uploads.service.js';

type UploadedImage = { buffer: Buffer; size: number };

@Controller('uploads')
export class UploadsController {
  constructor(private uploads: UploadsService) {}

  // Guards run first, so a visitor who is not signed in never gets to send a file.
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SELLER', 'ADMIN')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 5 * 1024 * 1024, files: 1 } }))
  upload(@UploadedFile() file: UploadedImage | undefined) {
    if (!file || !file.buffer) throw new BadRequestException('Send one picture in the "file" field.');
    return this.uploads.saveImage(file.buffer);
  }
}