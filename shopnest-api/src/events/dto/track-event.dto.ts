import { IsIn, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class TrackEventDto {
  @IsIn(['SHOP_VIEW', 'PRODUCT_VIEW', 'WHATSAPP_CLICK'])
  type!: 'SHOP_VIEW' | 'PRODUCT_VIEW' | 'WHATSAPP_CLICK';

  @IsOptional()
  @IsString()
  @MaxLength(64)
  productId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  storeSlug?: string;

  @IsOptional()
  @IsIn(['home', 'store', 'product'])
  source?: string;

  @IsOptional()
  @IsUUID()
  visitorId?: string;
}
