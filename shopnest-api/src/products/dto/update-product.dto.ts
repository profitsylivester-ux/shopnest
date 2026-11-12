import { IsIn, IsInt, IsNumber, IsOptional, IsString, Min, Matches, MaxLength } from 'class-validator';
import { ProductStatus } from '@prisma/client';

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @IsOptional()
  @IsString()
  @Matches(/^(?:|https?:\/\/[^\s"'()<>\\]+|data:image\/(?:png|jpeg|webp|gif|avif);base64,[A-Za-z0-9+\/=]+)$/, { message: 'imageUrl must be an http(s) link or a png/jpeg/webp/gif/avif data image' })
  imageUrl?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  stockQuantity?: number;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  @Matches(/^[\p{L}\p{N}][\p{L}\p{N} &,'\/\-]*$/u, { message: 'category contains invalid characters' })
  category?: string;

  @IsOptional()
  @IsIn(['New', 'Used', 'Refurbished'])
  condition?: string;

  @IsOptional()
  @IsIn(['ACTIVE', 'HIDDEN'])
  status?: ProductStatus;
}