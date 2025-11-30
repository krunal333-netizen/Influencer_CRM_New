import { ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Response, CookieOptions } from 'express';
import * as argon2 from 'argon2';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthResult } from './interfaces/auth-result.interface';
import { AuthTokens } from './interfaces/auth-tokens.interface';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { DEFAULT_USER_ROLE, ACCESS_TOKEN_TTL_FALLBACK, REFRESH_TOKEN_TTL_FALLBACK } from './constants/auth.constants';
import { SafeUser, UserWithRelations } from '../users/types/user.types';
import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from '../common/constants/cookie.constants';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(payload: RegisterDto): Promise<AuthResult> {
    const existingUser = await this.usersService.findByEmail(payload.email);
    if (existingUser) {
      throw new ConflictException('Email address is already registered');
    }

    const hashedPassword = await argon2.hash(payload.password);

    const user = await this.usersService.createUser({
      email: payload.email,
      name: payload.name,
      password: hashedPassword,
      firmId: payload.firmId,
      roleNames: [DEFAULT_USER_ROLE],
    });

    const tokens = await this.generateTokens(user);
    await this.saveHashedRefreshToken(user.id, tokens.refreshToken);

    const safeUser = this.usersService.sanitize(user);
    if (!safeUser) {
      throw new UnauthorizedException('Unable to process registration result');
    }

    return { user: safeUser, tokens };
  }

  async login(payload: LoginDto): Promise<AuthResult> {
    const user = await this.usersService.findByEmail(payload.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordValid = await argon2.verify(user.password, payload.password);
    if (!passwordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.generateTokens(user);
    await this.saveHashedRefreshToken(user.id, tokens.refreshToken);

    const safeUser = this.usersService.sanitize(user);
    if (!safeUser) {
      throw new UnauthorizedException('Unable to process login result');
    }

    return { user: safeUser, tokens };
  }

  async refreshTokens(refreshToken?: string): Promise<AuthResult> {
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token missing');
    }

    let payload: JwtPayload;
    try {
      payload = await this.jwtService.verifyAsync<JwtPayload>(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (payload.tokenType && payload.tokenType !== 'refresh') {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const user = await this.usersService.findById(payload.sub);
    if (!user || !user.hashedRefreshToken) {
      throw new UnauthorizedException('Refresh token revoked');
    }

    const isValid = await argon2.verify(user.hashedRefreshToken, refreshToken);
    if (!isValid) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const tokens = await this.generateTokens(user);
    await this.saveHashedRefreshToken(user.id, tokens.refreshToken);

    const safeUser = this.usersService.sanitize(user);
    if (!safeUser) {
      throw new UnauthorizedException('Unable to refresh session');
    }

    return { user: safeUser, tokens };
  }

  async getProfile(userId: string): Promise<SafeUser> {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const safeUser = this.usersService.sanitize(user);
    if (!safeUser) {
      throw new NotFoundException('User not found');
    }

    return safeUser;
  }

  async logout(userId: string, response: Response): Promise<{ message: string }> {
    await this.usersService.updateRefreshTokenHash(userId, null);
    this.clearAuthCookies(response);
    return { message: 'Logged out successfully' };
  }

  setAuthCookies(response: Response, tokens: AuthTokens): void {
    const isProduction = this.configService.get('NODE_ENV') === 'production';
    const domain = this.configService.get<string>('COOKIE_DOMAIN');
    const accessFallbackMs = this.durationToMs(ACCESS_TOKEN_TTL_FALLBACK, 15 * 60 * 1000);
    const refreshFallbackMs = this.durationToMs(REFRESH_TOKEN_TTL_FALLBACK, 7 * 24 * 60 * 60 * 1000);
    const accessTtl = this.durationToMs(this.configService.get('JWT_ACCESS_EXPIRES_IN'), accessFallbackMs);
    const refreshTtl = this.durationToMs(this.configService.get('JWT_REFRESH_EXPIRES_IN'), refreshFallbackMs);

    const baseOptions: CookieOptions = {
      httpOnly: true,
      sameSite: isProduction ? 'none' : 'lax',
      secure: isProduction,
      domain: domain || undefined,
      path: '/',
    };

    response.cookie(ACCESS_TOKEN_COOKIE, tokens.accessToken, {
      ...baseOptions,
      maxAge: accessTtl,
    });

    response.cookie(REFRESH_TOKEN_COOKIE, tokens.refreshToken, {
      ...baseOptions,
      maxAge: refreshTtl,
    });
  }

  clearAuthCookies(response: Response): void {
    const isProduction = this.configService.get('NODE_ENV') === 'production';
    const domain = this.configService.get<string>('COOKIE_DOMAIN');
    const baseOptions: CookieOptions = {
      httpOnly: true,
      sameSite: isProduction ? 'none' : 'lax',
      secure: isProduction,
      domain: domain || undefined,
      path: '/',
    };

    response.cookie(ACCESS_TOKEN_COOKIE, '', { ...baseOptions, maxAge: 0 });
    response.cookie(REFRESH_TOKEN_COOKIE, '', { ...baseOptions, maxAge: 0 });
  }

  private async generateTokens(user: UserWithRelations): Promise<AuthTokens> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      firmId: user.firmId ?? null,
      roles: user.roles.map((role) => role.name),
      tokenType: 'access',
    };

    const accessTokenPromise = this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
      expiresIn: this.configService.get<string>('JWT_ACCESS_EXPIRES_IN') ?? ACCESS_TOKEN_TTL_FALLBACK,
    });

    const refreshTokenPromise = this.jwtService.signAsync(
      { ...payload, tokenType: 'refresh' },
      {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') ?? REFRESH_TOKEN_TTL_FALLBACK,
      },
    );

    const [accessToken, refreshToken] = await Promise.all([accessTokenPromise, refreshTokenPromise]);
    return { accessToken, refreshToken };
  }

  private async saveHashedRefreshToken(userId: string, refreshToken: string): Promise<void> {
    const hashedRefreshToken = await argon2.hash(refreshToken);
    await this.usersService.updateRefreshTokenHash(userId, hashedRefreshToken);
  }

  private durationToMs(value: string | number | undefined, fallback: number): number {
    if (typeof value === 'number' && !Number.isNaN(value)) {
      return value;
    }

    if (!value) {
      return fallback;
    }

    const numericValue = Number(value);
    if (!Number.isNaN(numericValue)) {
      return numericValue;
    }

    const match = value.toString().trim().match(/^(\d+)(s|m|h|d)$/i);
    if (!match) {
      return fallback;
    }

    const amount = parseInt(match[1], 10);
    const unit = match[2].toLowerCase();

    switch (unit) {
      case 's':
        return amount * 1000;
      case 'm':
        return amount * 60 * 1000;
      case 'h':
        return amount * 60 * 60 * 1000;
      case 'd':
        return amount * 24 * 60 * 60 * 1000;
      default:
        return fallback;
    }
  }
}
