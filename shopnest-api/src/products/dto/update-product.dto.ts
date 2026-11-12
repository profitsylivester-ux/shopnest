import { IsIn, IsInt, IsNumber, IsOptional, IsString, Min, Matches } from 'class-validator';
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
  @IsIn(['Electronics', 'Fashion', 'Shoes', 'Vehicles', 'Food', 'Services'])
  category?: string;

  @IsOptional()
  @IsIn(['New', 'Used', 'Refurbished'])
  condition?: string;

  @IsOptional()
  @IsIn(['ACTIVE', 'HIDDEN'])
  status?: ProductStatus;
}