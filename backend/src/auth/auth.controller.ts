import { Body, Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AccessTokenGuard } from '../common/guards/access-token.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { REFRESH_TOKEN_COOKIE } from '../common/constants/cookie.constants';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() payload: RegisterDto, @Res({ passthrough: true }) response: Response) {
    const result = await this.authService.register(payload);
    this.authService.setAuthCookies(response, result.tokens);
    return {
      message: 'Registration successful',
      user: result.user,
    };
  }

  @Post('login')
  async login(@Body() payload: LoginDto, @Res({ passthrough: true }) response: Response) {
    const result = await this.authService.login(payload);
    this.authService.setAuthCookies(response, result.tokens);
    return {
      message: 'Login successful',
      user: result.user,
    };
  }

  @Post('refresh')
  async refresh(@Req() request: Request, @Res({ passthrough: true }) response: Response) {
    const refreshToken = request.cookies?.[REFRESH_TOKEN_COOKIE];
    const result = await this.authService.refreshTokens(refreshToken);
    this.authService.setAuthCookies(response, result.tokens);
    return {
      message: 'Session refreshed',
      user: result.user,
    };
  }

  @Get('me')
  @UseGuards(AccessTokenGuard)
  async me(@CurrentUser('sub') userId: string) {
    const profile = await this.authService.getProfile(userId);
    return profile;
  }

  @Post('logout')
  @UseGuards(AccessTokenGuard)
  async logout(@CurrentUser('sub') userId: string, @Res({ passthrough: true }) response: Response) {
    return this.authService.logout(userId, response);
  }
}
