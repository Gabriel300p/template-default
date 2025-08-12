import { 
  Injectable, 
  UnauthorizedException, 
  BadRequestException,
  ConflictException,
  Logger 
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@/shared/database/prisma.service';
import { TokenService } from './token.service';
import { PasswordService } from './password.service';
import { LoginDto, LoginResponseDto } from '../../presentation/dto/login.dto';
import { RegisterDto, RegisterResponseDto } from '../../presentation/dto/register.dto';
import { ChangePasswordDto } from '../../presentation/dto/change-password.dto';
import { User } from '@prisma/client';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly tokenService: TokenService,
    private readonly passwordService: PasswordService,
    private readonly configService: ConfigService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email },
        include: {
          roles: {
            include: {
              role: {
                include: {
                  permissions: {
                    include: {
                      permission: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!user) {
        return null;
      }

      if (!user.isActive) {
        throw new UnauthorizedException('Account is deactivated');
      }

      if (user.isSuspended) {
        throw new UnauthorizedException('Account is suspended');
      }

      const isPasswordValid = await this.passwordService.validatePassword(
        password,
        user.password,
      );

      if (!isPasswordValid) {
        return null;
      }

      // Update last login
      await this.prisma.user.update({
        where: { id: user.id },
        data: { lastLogin: new Date() },
      });

      const { password: _, ...result } = user;
      return result;
    } catch (error) {
      this.logger.error('Error validating user', error);
      throw error;
    }
  }

  async login(loginDto: LoginDto, ipAddress?: string, userAgent?: string): Promise<LoginResponseDto> {
    try {
      const user = await this.validateUser(loginDto.email, loginDto.password);
      
      if (!user) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const payload = {
        sub: user.id,
        email: user.email,
        username: user.username,
        roles: user.roles.map(ur => ur.role.name),
      };

      const tokens = await this.tokenService.generateTokens(payload);

      // Create session
      await this.prisma.session.create({
        data: {
          userId: user.id,
          token: tokens.accessToken,
          expiresAt: new Date(Date.now() + 3600 * 1000), // 1 hour
          ipAddress,
          userAgent,
        },
      });

      // Store refresh token
      const refreshTokenExpiry = loginDto.rememberMe 
        ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
        : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

      await this.prisma.refreshToken.create({
        data: {
          userId: user.id,
          token: tokens.refreshToken,
          expiresAt: refreshTokenExpiry,
        },
      });

      return {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        tokenType: 'Bearer',
        expiresIn: 3600,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          avatar: user.avatar,
          roles: user.roles.map(ur => ur.role.name),
        },
      };
    } catch (error) {
      this.logger.error('Error during login', error);
      throw error;
    }
  }

  async register(registerDto: RegisterDto): Promise<RegisterResponseDto> {
    try {
      // Check if passwords match
      if (registerDto.password !== registerDto.confirmPassword) {
        throw new BadRequestException('Passwords do not match');
      }

      // Check if user already exists
      const existingUser = await this.prisma.user.findFirst({
        where: {
          OR: [
            { email: registerDto.email },
            ...(registerDto.username ? [{ username: registerDto.username }] : []),
          ],
        },
      });

      if (existingUser) {
        if (existingUser.email === registerDto.email) {
          throw new ConflictException('Email already exists');
        }
        if (existingUser.username === registerDto.username) {
          throw new ConflictException('Username already exists');
        }
      }

      // Hash password
      const hashedPassword = await this.passwordService.hashPassword(registerDto.password);

      // Create user
      const user = await this.prisma.user.create({
        data: {
          email: registerDto.email,
          username: registerDto.username,
          firstName: registerDto.firstName,
          lastName: registerDto.lastName,
          password: hashedPassword,
          emailVerified: this.configService.get<boolean>('EMAIL_VERIFICATION_ENABLED') ? null : new Date(),
        },
      });

      // Assign default user role
      const userRole = await this.prisma.role.findUnique({
        where: { name: 'user' },
      });

      if (userRole) {
        await this.prisma.userRole.create({
          data: {
            userId: user.id,
            roleId: userRole.id,
          },
        });
      }

      const { password: _, ...userWithoutPassword } = user;

      return {
        message: 'User registered successfully',
        user: {
          id: userWithoutPassword.id,
          email: userWithoutPassword.email,
          username: userWithoutPassword.username,
          firstName: userWithoutPassword.firstName,
          lastName: userWithoutPassword.lastName,
          emailVerified: !!userWithoutPassword.emailVerified,
        },
        emailVerificationRequired: this.configService.get<boolean>('EMAIL_VERIFICATION_ENABLED', false),
      };
    } catch (error) {
      this.logger.error('Error during registration', error);
      throw error;
    }
  }

  async changePassword(userId: string, changePasswordDto: ChangePasswordDto): Promise<void> {
    try {
      // Check if new passwords match
      if (changePasswordDto.newPassword !== changePasswordDto.confirmNewPassword) {
        throw new BadRequestException('New passwords do not match');
      }

      // Get user
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      // Validate current password
      const isCurrentPasswordValid = await this.passwordService.validatePassword(
        changePasswordDto.currentPassword,
        user.password,
      );

      if (!isCurrentPasswordValid) {
        throw new UnauthorizedException('Current password is incorrect');
      }

      // Hash new password
      const hashedNewPassword = await this.passwordService.hashPassword(
        changePasswordDto.newPassword,
      );

      // Update password
      await this.prisma.user.update({
        where: { id: userId },
        data: { 
          password: hashedNewPassword,
          updatedAt: new Date(),
        },
      });

      // Revoke all refresh tokens for security
      await this.prisma.refreshToken.updateMany({
        where: { userId },
        data: { isRevoked: true },
      });

      // Deactivate all sessions
      await this.prisma.session.updateMany({
        where: { userId },
        data: { isActive: false },
      });

      this.logger.log(`Password changed for user ${userId}`);
    } catch (error) {
      this.logger.error('Error changing password', error);
      throw error;
    }
  }

  async logout(userId: string, token: string): Promise<void> {
    try {
      // Deactivate session
      await this.prisma.session.updateMany({
        where: { 
          userId,
          token,
        },
        data: { isActive: false },
      });

      this.logger.log(`User ${userId} logged out`);
    } catch (error) {
      this.logger.error('Error during logout', error);
      throw error;
    }
  }

  async logoutAll(userId: string): Promise<void> {
    try {
      // Deactivate all sessions
      await this.prisma.session.updateMany({
        where: { userId },
        data: { isActive: false },
      });

      // Revoke all refresh tokens
      await this.prisma.refreshToken.updateMany({
        where: { userId },
        data: { isRevoked: true },
      });

      this.logger.log(`All sessions logged out for user ${userId}`);
    } catch (error) {
      this.logger.error('Error during logout all', error);
      throw error;
    }
  }

  async refreshToken(refreshToken: string): Promise<any> {
    try {
      const storedToken = await this.prisma.refreshToken.findUnique({
        where: { token: refreshToken },
        include: {
          user: {
            include: {
              roles: {
                include: {
                  role: true,
                },
              },
            },
          },
        },
      });

      if (!storedToken || storedToken.isRevoked || storedToken.expiresAt < new Date()) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const payload = {
        sub: storedToken.user.id,
        email: storedToken.user.email,
        username: storedToken.user.username,
        roles: storedToken.user.roles.map(ur => ur.role.name),
      };

      const tokens = await this.tokenService.generateTokens(payload);

      // Revoke old refresh token
      await this.prisma.refreshToken.update({
        where: { id: storedToken.id },
        data: { isRevoked: true },
      });

      // Create new refresh token
      await this.prisma.refreshToken.create({
        data: {
          userId: storedToken.user.id,
          token: tokens.refreshToken,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        },
      });

      return {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        tokenType: 'Bearer',
        expiresIn: 3600,
      };
    } catch (error) {
      this.logger.error('Error refreshing token', error);
      throw error;
    }
  }
}

