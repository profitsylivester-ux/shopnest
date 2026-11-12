import { IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Min, Matches, IsIn, MaxLength } from 'class-validator';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  @Min(0)
  price: number;

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
}