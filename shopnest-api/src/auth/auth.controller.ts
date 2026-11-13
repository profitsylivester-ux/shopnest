import { Controller, Post, Body, Get, Patch, UseGuards, HttpCode, HttpStatus, Req } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { ThrottlerGuard } from '@nestjs/throttler';
import { RegisterDto, LoginDto, UpdateProfileDto, ChangePasswordDto, ChangeEmailDto } from './dto/auth.dto.js';
import { JwtAuthGuard } from './guards/jwt-auth.guard.js';
import { CurrentUser } from './decorators/current-user.decorator.js';
import { reqMeta } from '../audit/request-meta.js';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register') @UseGuards(ThrottlerGuard)
  register(@Body() dto: RegisterDto, @Req() req: any) { return this.authService.register(dto, reqMeta(req)); }

  @Post('login') @HttpCode(HttpStatus.OK) @UseGuards(ThrottlerGuard)
  login(@Body() dto: LoginDto, @Req() req: any) { return this.authService.login(dto, reqMeta(req)); }

  @Get('me') @UseGuards(JwtAuthGuard)
  me(@CurrentUser() user: any) { return { user }; }

  @Get('account') @UseGuards(JwtAuthGuard)
  account(@CurrentUser('sub') userId: string) { return this.authService.account(userId); }

  @Post('logout') @HttpCode(HttpStatus.OK) @UseGuards(JwtAuthGuard)
  logout(@CurrentUser('sub') userId: string, @Req() req: any) { return this.authService.logout(userId, reqMeta(req)); }

  @Patch('profile') @UseGuards(JwtAuthGuard)
  profile(@CurrentUser('sub') userId: string, @Body() dto: UpdateProfileDto, @Req() req: any) { return this.authService.updateName(userId, dto.name, reqMeta(req)); }

  @Post('change-password') @HttpCode(HttpStatus.OK) @UseGuards(ThrottlerGuard, JwtAuthGuard)
  changePassword(@CurrentUser('sub') userId: string, @Body() dto: ChangePasswordDto, @Req() req: any) { return this.authService.changePassword(userId, dto, reqMeta(req)); }

  @Post('change-email') @HttpCode(HttpStatus.OK) @UseGuards(ThrottlerGuard, JwtAuthGuard)
  changeEmail(@CurrentUser('sub') userId: string, @Body() dto: ChangeEmailDto, @Req() req: any) { return this.authService.changeEmail(userId, dto, reqMeta(req)); }

  @Post('logout-all') @HttpCode(HttpStatus.OK) @UseGuards(JwtAuthGuard)
  logoutAll(@CurrentUser('sub') userId: string, @Req() req: any) { return this.authService.logoutAll(userId, reqMeta(req)); }
}
