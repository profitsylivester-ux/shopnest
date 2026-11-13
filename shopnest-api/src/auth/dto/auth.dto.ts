import { IsEmail, IsIn, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  @IsIn(['BUYER', 'SELLER'])
  role?: string;
}

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}

export class UpdateProfileDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  name: string;
}

export class ChangePasswordDto {
  @IsString()
  currentPassword: string;

  @IsString()
  @MinLength(8)
  @MaxLength(72)
  newPassword: string;
}

export class ChangeEmailDto {
  @IsString()
  password: string;

  @IsEmail()
  newEmail: string;
}
