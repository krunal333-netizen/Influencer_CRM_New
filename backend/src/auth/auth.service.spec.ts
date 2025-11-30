import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { DEFAULT_USER_ROLE } from './constants/auth.constants';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { SafeUser, UserWithRelations } from '../users/types/user.types';

jest.mock('argon2', () => ({
  hash: jest.fn(),
  verify: jest.fn(),
}));

import * as argon2 from 'argon2';

const mockedArgon = argon2 as jest.Mocked<typeof argon2>;

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let jwtService: jest.Mocked<JwtService>;
  let configService: jest.Mocked<ConfigService>;

  const baseUser: UserWithRelations = {
    id: 'user-1',
    email: 'user@example.com',
    name: 'Test User',
    password: 'stored-password-hash',
    hashedRefreshToken: null,
    firmId: 'firm-1',
    firm: {
      id: 'firm-1',
      name: 'Firm One',
      email: 'firm@example.com',
      phone: null,
      address: null,
      city: null,
      state: null,
      zipCode: null,
      country: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    roles: [
      {
        id: 'role-1',
        name: 'COORDINATOR',
        description: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const safeUser: SafeUser = {
    id: baseUser.id,
    email: baseUser.email,
    name: baseUser.name,
    firmId: baseUser.firmId,
    firm: baseUser.firm,
    roles: baseUser.roles,
    createdAt: baseUser.createdAt,
    updatedAt: baseUser.updatedAt,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockedArgon.hash.mockReset();
    mockedArgon.verify.mockReset();

    usersService = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
      createUser: jest.fn(),
      updateRefreshTokenHash: jest.fn(),
      sanitize: jest.fn(),
    } as unknown as jest.Mocked<UsersService>;

    jwtService = {
      signAsync: jest.fn(),
      verifyAsync: jest.fn(),
    } as unknown as jest.Mocked<JwtService>;

    configService = {
      get: jest.fn((key: string) => {
        switch (key) {
          case 'JWT_ACCESS_SECRET':
            return 'access-secret';
          case 'JWT_REFRESH_SECRET':
            return 'refresh-secret';
          case 'JWT_ACCESS_EXPIRES_IN':
            return '15m';
          case 'JWT_REFRESH_EXPIRES_IN':
            return '7d';
          default:
            return undefined;
        }
      }),
    } as unknown as jest.Mocked<ConfigService>;

    authService = new AuthService(usersService, jwtService, configService);
  });

  describe('register', () => {
    it('creates a new user with hashed password and refresh token', async () => {
      const dto: RegisterDto = {
        name: 'Test User',
        email: 'user@example.com',
        password: 'Password123!',
      };

      usersService.findByEmail.mockResolvedValue(null);
      usersService.createUser.mockResolvedValue(baseUser);
      usersService.sanitize.mockReturnValue(safeUser);
      jwtService.signAsync.mockResolvedValueOnce('access-token');
      jwtService.signAsync.mockResolvedValueOnce('refresh-token');
      mockedArgon.hash.mockResolvedValueOnce('hashed-password');
      mockedArgon.hash.mockResolvedValueOnce('hashed-refresh-token');

      const result = await authService.register(dto);

      expect(usersService.createUser).toHaveBeenCalledWith({
        email: dto.email,
        name: dto.name,
        password: 'hashed-password',
        firmId: undefined,
        roleNames: [DEFAULT_USER_ROLE],
      });
      expect(usersService.updateRefreshTokenHash).toHaveBeenCalledWith(baseUser.id, 'hashed-refresh-token');
      expect(result.user).toEqual(safeUser);
      expect(result.tokens).toEqual({ accessToken: 'access-token', refreshToken: 'refresh-token' });
    });
  });

  describe('login', () => {
    it('throws on invalid credentials', async () => {
      const dto: LoginDto = { email: 'user@example.com', password: 'bad-pass' };

      usersService.findByEmail.mockResolvedValue(baseUser);
      mockedArgon.verify.mockResolvedValue(false);

      await expect(authService.login(dto)).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('returns sanitized user + tokens when credentials are valid', async () => {
      const dto: LoginDto = { email: 'user@example.com', password: 'Password123!' };

      usersService.findByEmail.mockResolvedValue(baseUser);
      usersService.sanitize.mockReturnValue(safeUser);
      mockedArgon.verify.mockResolvedValue(true);
      jwtService.signAsync.mockResolvedValueOnce('login-access');
      jwtService.signAsync.mockResolvedValueOnce('login-refresh');
      mockedArgon.hash.mockResolvedValue('login-refresh-hash');

      const result = await authService.login(dto);

      expect(usersService.updateRefreshTokenHash).toHaveBeenCalledWith(baseUser.id, 'login-refresh-hash');
      expect(result.user).toEqual(safeUser);
      expect(result.tokens).toEqual({ accessToken: 'login-access', refreshToken: 'login-refresh' });
    });
  });

  describe('refreshTokens', () => {
    it('rotates refresh tokens when provided with a valid cookie token', async () => {
      const refreshToken = 'old-refresh-token';
      const payload: JwtPayload = { sub: baseUser.id, email: baseUser.email, roles: ['COORDINATOR'], firmId: 'firm-1', tokenType: 'refresh' };

      jwtService.verifyAsync.mockResolvedValue(payload);
      usersService.findById.mockResolvedValue({ ...baseUser, hashedRefreshToken: 'stored-hash' });
      usersService.sanitize.mockReturnValue(safeUser);
      mockedArgon.verify.mockResolvedValue(true);
      jwtService.signAsync.mockResolvedValueOnce('new-access-token');
      jwtService.signAsync.mockResolvedValueOnce('new-refresh-token');
      mockedArgon.hash.mockResolvedValue('new-refresh-hash');

      const result = await authService.refreshTokens(refreshToken);

      expect(jwtService.verifyAsync).toHaveBeenCalledWith(refreshToken, { secret: 'refresh-secret' });
      expect(usersService.updateRefreshTokenHash).toHaveBeenCalledWith(baseUser.id, 'new-refresh-hash');
      expect(result.tokens.accessToken).toBe('new-access-token');
      expect(result.tokens.refreshToken).toBe('new-refresh-token');
      expect(result.user).toEqual(safeUser);
    });
  });
});
