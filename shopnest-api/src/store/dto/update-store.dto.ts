import { IsBoolean, IsIn, IsOptional, IsString, Matches, MaxLength } from 'class-validator';

const INSTAGRAM = /^$|^https:\/\/(www\.)?instagram\.com\/[^\s"'<>]+$/i;
const FACEBOOK = /^$|^https:\/\/(www\.|m\.)?facebook\.com\/[^\s"'<>]+$/i;
const TIKTOK = /^$|^https:\/\/(www\.)?tiktok\.com\/[^\s"'<>]+$/i;

const IMAGE = /^$|^(?:https?:\/\/[^\s"'()<>\\]+|\/uploads\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}(?:-sm)?\.webp|data:image\/(?:png|jpeg|webp|gif|avif);base64,[A-Za-z0-9+\/=]+)$/;
const IMAGE_MSG = 'Image must be a web link, an uploaded picture, or a png/jpeg/webp/gif/avif data image';

export class UpdateStoreDto {
  @IsOptional() @IsString() @MaxLength(100)
  name?: string;

  @IsOptional() @IsString() @MaxLength(1000)
  description?: string;

  @IsOptional() @IsString() @MaxLength(20)
  whatsappNumber?: string;

  @IsOptional() @IsString() @Matches(IMAGE, { message: IMAGE_MSG })
  logoUrl?: string;

  @IsOptional() @IsString() @Matches(IMAGE, { message: IMAGE_MSG })
  bannerUrl?: string;

  @IsOptional() @IsString() @MaxLength(100)
  location?: string;

  @IsOptional() @IsIn(['Online', 'Physical', 'Both'])
  shopType?: string;

  @IsOptional() @IsString() @MaxLength(200) @Matches(INSTAGRAM, { message: 'Instagram link must start with https://instagram.com/ or https://www.instagram.com/' })
  instagramUrl?: string;

  @IsOptional() @IsString() @MaxLength(200) @Matches(FACEBOOK, { message: 'Facebook link must start with https://facebook.com/ or https://www.facebook.com/' })
  facebookUrl?: string;

  @IsOptional() @IsString() @MaxLength(200) @Matches(TIKTOK, { message: 'TikTok link must start with https://tiktok.com/ or https://www.tiktok.com/' })
  tiktokUrl?: string;

  @IsOptional() @IsString() @MaxLength(1200)
  openingHours?: string;

  @IsOptional() @IsString() @MaxLength(600)
  deliveryReturns?: string;

  @IsOptional() @IsString() @MaxLength(160)
  announcement?: string;

  @IsOptional() @IsBoolean()
  isPaused?: boolean;
}

export class SlugDto {
  @IsString() @MaxLength(60)
  slug: string;
}
