import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException, ConflictException } from '@nestjs/common';

import { AuthService } from './auth.service';
import { TokenService } from './token.service';
import { PasswordService } from './password.service';
import { AuthRepository } from '../../infrastructure/repositories/auth.repository';
import { SessionRepository } from '../../infrastructure/repositories/session.repository';
import { PrismaService } from '@/shared/database/prisma.service';

describe('AuthService', () => {
  let service: AuthService;
  let authRepository: jest.Mocked<AuthRepository>;
  let sessionRepository: jest.Mocked<SessionRepository>;
  let tokenService: jest.Mocked<TokenService>;
  let passwordService: jest.Mocked<PasswordService>;
  let prismaService: jest.Mocked<PrismaService>;

  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    name: 'Test User',
    password: 'hashedPassword',
    isActive: true,
    isEmailVerified: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockTokens = {
    accessToken: 'access-token',
    refreshToken: 'refresh-token',
  };

  beforeEach(async () => {
    const mockAuthRepository = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updatePassword: jest.fn(),
    };

    const mockSessionRepository = {
      create: jest.fn(),
      findByToken: jest.fn(),
      deleteByUserId: jest.fn(),
      deleteByToken: jest.fn(),
      cleanup: jest.fn(),
    };

    const mockTokenService = {
      generateTokens: jest.fn(),
      verifyAccessToken: jest.fn(),
      verifyRefreshToken: jest.fn(),
      generatePasswordResetToken: jest.fn(),
      verifyPasswordResetToken: jest.fn(),
    };

    const mockPasswordService = {
      hash: jest.fn(),
      compare: jest.fn(),
      validate: jest.fn(),
      generateResetToken: jest.fn(),
    };

    const mockPrismaService = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      session: {
        create: jest.fn(),
        findUnique: jest.fn(),
        deleteMany: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: AuthRepository,
          useValue: mockAuthRepository,
        },
        {
          provide: SessionRepository,
          useValue: mockSessionRepository,
        },
        {
          provide: TokenService,
          useValue: mockTokenService,
        },
        {
          provide: PasswordService,
          useValue: mockPasswordService,
        },
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              const config = {
                'JWT_SECRET': 'test-secret',
                'JWT_EXPIRES_IN': '15m',
                'JWT_REFRESH_SECRET': 'test-refresh-secret',
                'JWT_REFRESH_EXPIRES_IN': '7d',
              };
              return config[key];
            }),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    authRepository = module.get(AuthRepository);
    sessionRepository = module.get(SessionRepository);
    tokenService = module.get(TokenService);
    passwordService = module.get(PasswordService);
    prismaService = module.get(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    const registerDto = {
      email: 'test@example.com',
      password: 'Password123!',
      name: 'Test User',
    };

    it('should register a new user successfully', async () => {
      authRepository.findByEmail.mockResolvedValue(null);
      passwordService.hash.mockResolvedValue('hashedPassword');
      authRepository.create.mockResolvedValue(mockUser);
      tokenService.generateTokens.mockResolvedValue(mockTokens);
      sessionRepository.create.mockResolvedValue({
        id: 'session-123',
        userId: mockUser.id,
        refreshToken: mockTokens.refreshToken,
        expiresAt: new Date(),
        createdAt: new Date(),
      });

      const result = await service.register(registerDto);

      expect(result).toEqual({
        user: {
          id: mockUser.id,
          email: mockUser.email,
          name: mockUser.name,
          isActive: mockUser.isActive,
          isEmailVerified: mockUser.isEmailVerified,
        },
        tokens: mockTokens,
      });

      expect(authRepository.findByEmail).toHaveBeenCalledWith(registerDto.email);
      expect(passwordService.hash).toHaveBeenCalledWith(registerDto.password);
      expect(authRepository.create).toHaveBeenCalledWith({
        email: registerDto.email,
        password: 'hashedPassword',
        name: registerDto.name,
      });
      expect(tokenService.generateTokens).toHaveBeenCalledWith({
        sub: mockUser.id,
        email: mockUser.email,
      });
      expect(sessionRepository.create).toHaveBeenCalled();
    });

    it('should throw ConflictException if user already exists', async () => {
      authRepository.findByEmail.mockResolvedValue(mockUser);

      await expect(service.register(registerDto)).rejects.toThrow(ConflictException);
      expect(authRepository.findByEmail).toHaveBeenCalledWith(registerDto.email);
    });
  });

  describe('login', () => {
    const loginDto = {
      email: 'test@example.com',
      password: 'Password123!',
    };

    it('should login user successfully', async () => {
      authRepository.findByEmail.mockResolvedValue(mockUser);
      passwordService.compare.mockResolvedValue(true);
      tokenService.generateTokens.mockResolvedValue(mockTokens);
      sessionRepository.create.mockResolvedValue({
        id: 'session-123',
        userId: mockUser.id,
        refreshToken: mockTokens.refreshToken,
        expiresAt: new Date(),
        createdAt: new Date(),
      });

      const result = await service.login(loginDto);

      expect(result).toEqual({
        user: {
          id: mockUser.id,
          email: mockUser.email,
          name: mockUser.name,
          isActive: mockUser.isActive,
          isEmailVerified: mockUser.isEmailVerified,
        },
        tokens: mockTokens,
      });

      expect(authRepository.findByEmail).toHaveBeenCalledWith(loginDto.email);
      expect(passwordService.compare).toHaveBeenCalledWith(loginDto.password, mockUser.password);
      expect(tokenService.generateTokens).toHaveBeenCalled();
    });

    it('should throw UnauthorizedException for invalid credentials', async () => {
      authRepository.findByEmail.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
      expect(authRepository.findByEmail).toHaveBeenCalledWith(loginDto.email);
    });

    it('should throw UnauthorizedException for wrong password', async () => {
      authRepository.findByEmail.mockResolvedValue(mockUser);
      passwordService.compare.mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
      expect(passwordService.compare).toHaveBeenCalledWith(loginDto.password, mockUser.password);
    });

    it('should throw UnauthorizedException for inactive user', async () => {
      const inactiveUser = { ...mockUser, isActive: false };
      authRepository.findByEmail.mockResolvedValue(inactiveUser);
      passwordService.compare.mockResolvedValue(true);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('refreshTokens', () => {
    const refreshTokenDto = {
      refreshToken: 'valid-refresh-token',
    };

    it('should refresh tokens successfully', async () => {
      const mockSession = {
        id: 'session-123',
        userId: mockUser.id,
        refreshToken: refreshTokenDto.refreshToken,
        expiresAt: new Date(Date.now() + 86400000), // 1 day from now
        createdAt: new Date(),
      };

      tokenService.verifyRefreshToken.mockResolvedValue({ sub: mockUser.id });
      sessionRepository.findByToken.mockResolvedValue(mockSession);
      authRepository.findById.mockResolvedValue(mockUser);
      tokenService.generateTokens.mockResolvedValue(mockTokens);
      sessionRepository.create.mockResolvedValue({
        ...mockSession,
        refreshToken: mockTokens.refreshToken,
      });

      const result = await service.refreshTokens(refreshTokenDto);

      expect(result).toEqual({
        user: {
          id: mockUser.id,
          email: mockUser.email,
          name: mockUser.name,
          isActive: mockUser.isActive,
          isEmailVerified: mockUser.isEmailVerified,
        },
        tokens: mockTokens,
      });

      expect(tokenService.verifyRefreshToken).toHaveBeenCalledWith(refreshTokenDto.refreshToken);
      expect(sessionRepository.findByToken).toHaveBeenCalledWith(refreshTokenDto.refreshToken);
      expect(authRepository.findById).toHaveBeenCalledWith(mockUser.id);
    });

    it('should throw UnauthorizedException for invalid refresh token', async () => {
      tokenService.verifyRefreshToken.mockRejectedValue(new Error('Invalid token'));

      await expect(service.refreshTokens(refreshTokenDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for non-existent session', async () => {
      tokenService.verifyRefreshToken.mockResolvedValue({ sub: mockUser.id });
      sessionRepository.findByToken.mockResolvedValue(null);

      await expect(service.refreshTokens(refreshTokenDto)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('logout', () => {
    it('should logout user successfully', async () => {
      sessionRepository.deleteByUserId.mockResolvedValue(undefined);

      await service.logout(mockUser.id);

      expect(sessionRepository.deleteByUserId).toHaveBeenCalledWith(mockUser.id);
    });
  });

  describe('changePassword', () => {
    const changePasswordDto = {
      currentPassword: 'oldPassword',
      newPassword: 'newPassword123!',
    };

    it('should change password successfully', async () => {
      authRepository.findById.mockResolvedValue(mockUser);
      passwordService.compare.mockResolvedValue(true);
      passwordService.hash.mockResolvedValue('newHashedPassword');
      authRepository.updatePassword.mockResolvedValue(undefined);
      sessionRepository.deleteByUserId.mockResolvedValue(undefined);

      await service.changePassword(mockUser.id, changePasswordDto);

      expect(authRepository.findById).toHaveBeenCalledWith(mockUser.id);
      expect(passwordService.compare).toHaveBeenCalledWith(
        changePasswordDto.currentPassword,
        mockUser.password
      );
      expect(passwordService.hash).toHaveBeenCalledWith(changePasswordDto.newPassword);
      expect(authRepository.updatePassword).toHaveBeenCalledWith(mockUser.id, 'newHashedPassword');
      expect(sessionRepository.deleteByUserId).toHaveBeenCalledWith(mockUser.id);
    });

    it('should throw UnauthorizedException for wrong current password', async () => {
      authRepository.findById.mockResolvedValue(mockUser);
      passwordService.compare.mockResolvedValue(false);

      await expect(service.changePassword(mockUser.id, changePasswordDto)).rejects.toThrow(
        UnauthorizedException
      );
    });
  });

  describe('validateUser', () => {
    it('should validate user successfully', async () => {
      authRepository.findById.mockResolvedValue(mockUser);

      const result = await service.validateUser(mockUser.id);

      expect(result).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
        isActive: mockUser.isActive,
        isEmailVerified: mockUser.isEmailVerified,
      });
      expect(authRepository.findById).toHaveBeenCalledWith(mockUser.id);
    });

    it('should return null for non-existent user', async () => {
      authRepository.findById.mockResolvedValue(null);

      const result = await service.validateUser('non-existent-id');

      expect(result).toBeNull();
    });

    it('should return null for inactive user', async () => {
      const inactiveUser = { ...mockUser, isActive: false };
      authRepository.findById.mockResolvedValue(inactiveUser);

      const result = await service.validateUser(mockUser.id);

      expect(result).toBeNull();
    });
  });
});

