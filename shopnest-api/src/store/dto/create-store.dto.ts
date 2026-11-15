import { IsNotEmpty, IsOptional, IsString, Matches, MaxLength } from 'class-validator';

const IMAGE = /^$|^(?:https?:\/\/[^\s"'()<>\\]+|\/uploads\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}(?:-sm)?\.webp|data:image\/(?:png|jpeg|webp|gif|avif);base64,[A-Za-z0-9+\/=]+)$/;
const IMAGE_MSG = 'Image must be a web link, an uploaded picture, or a png/jpeg/webp/gif/avif data image';

export class CreateStoreDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  whatsappNumber?: string;

  @IsOptional()
  @IsString()
  @Matches(IMAGE, { message: IMAGE_MSG })
  logoUrl?: string;

  @IsOptional()
  @IsString()
  @Matches(IMAGE, { message: IMAGE_MSG })
  bannerUrl?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  shopType?: string;
}