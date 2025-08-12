import { Injectable, Logger, ConflictException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@/shared/database/prisma.service';
import { TokenService } from './token.service';

export interface OAuthProfile {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  provider: string;
}

@Injectable()
export class OAuthService {
  private readonly logger = new Logger(OAuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly tokenService: TokenService,
    private readonly configService: ConfigService,
  ) {}

  async handleOAuthLogin(profile: OAuthProfile): Promise<any> {
    try {
      // Check if user provider already exists
      const existingProvider = await this.prisma.userProvider.findUnique({
        where: {
          provider_providerId: {
            provider: profile.provider,
            providerId: profile.id,
          },
        },
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

      if (existingProvider) {
        // User exists, update last login and return tokens
        await this.prisma.user.update({
          where: { id: existingProvider.user.id },
          data: { lastLogin: new Date() },
        });

        return this.generateTokensForUser(existingProvider.user);
      }

      // Check if user exists with the same email
      const existingUser = await this.prisma.user.findUnique({
        where: { email: profile.email },
        include: {
          roles: {
            include: {
              role: true,
            },
          },
        },
      });

      if (existingUser) {
        // Link OAuth provider to existing user
        await this.prisma.userProvider.create({
          data: {
            userId: existingUser.id,
            provider: profile.provider,
            providerId: profile.id,
            email: profile.email,
          },
        });

        await this.prisma.user.update({
          where: { id: existingUser.id },
          data: { lastLogin: new Date() },
        });

        return this.generateTokensForUser(existingUser);
      }

      // Create new user
      const newUser = await this.prisma.user.create({
        data: {
          email: profile.email,
          firstName: profile.firstName,
          lastName: profile.lastName,
          avatar: profile.avatar,
          emailVerified: new Date(), // OAuth emails are considered verified
          isActive: true,
          lastLogin: new Date(),
        },
        include: {
          roles: {
            include: {
              role: true,
            },
          },
        },
      });

      // Create OAuth provider link
      await this.prisma.userProvider.create({
        data: {
          userId: newUser.id,
          provider: profile.provider,
          providerId: profile.id,
          email: profile.email,
        },
      });

      // Assign default user role
      const userRole = await this.prisma.role.findUnique({
        where: { name: 'user' },
      });

      if (userRole) {
        await this.prisma.userRole.create({
          data: {
            userId: newUser.id,
            roleId: userRole.id,
          },
        });

        // Reload user with roles
        const userWithRoles = await this.prisma.user.findUnique({
          where: { id: newUser.id },
          include: {
            roles: {
              include: {
                role: true,
              },
            },
          },
        });

        return this.generateTokensForUser(userWithRoles);
      }

      return this.generateTokensForUser(newUser);
    } catch (error) {
      this.logger.error('Error handling OAuth login', error);
      throw error;
    }
  }

  async linkOAuthProvider(userId: string, profile: OAuthProfile): Promise<void> {
    try {
      // Check if provider is already linked to another user
      const existingProvider = await this.prisma.userProvider.findUnique({
        where: {
          provider_providerId: {
            provider: profile.provider,
            providerId: profile.id,
          },
        },
      });

      if (existingProvider && existingProvider.userId !== userId) {
        throw new ConflictException(
          `This ${profile.provider} account is already linked to another user`,
        );
      }

      // Check if user already has this provider linked
      const userProvider = await this.prisma.userProvider.findUnique({
        where: {
          userId_provider: {
            userId,
            provider: profile.provider,
          },
        },
      });

      if (userProvider) {
        // Update existing provider
        await this.prisma.userProvider.update({
          where: { id: userProvider.id },
          data: {
            providerId: profile.id,
            email: profile.email,
          },
        });
      } else {
        // Create new provider link
        await this.prisma.userProvider.create({
          data: {
            userId,
            provider: profile.provider,
            providerId: profile.id,
            email: profile.email,
          },
        });
      }

      this.logger.log(`OAuth provider ${profile.provider} linked to user ${userId}`);
    } catch (error) {
      this.logger.error('Error linking OAuth provider', error);
      throw error;
    }
  }

  async unlinkOAuthProvider(userId: string, provider: string): Promise<void> {
    try {
      // Check if user has a password (can't unlink if no password and only one provider)
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: {
          providers: true,
        },
      });

      if (!user) {
        throw new Error('User not found');
      }

      if (!user.password && user.providers.length === 1) {
        throw new ConflictException(
          'Cannot unlink the only authentication method. Please set a password first.',
        );
      }

      // Remove provider
      await this.prisma.userProvider.deleteMany({
        where: {
          userId,
          provider,
        },
      });

      this.logger.log(`OAuth provider ${provider} unlinked from user ${userId}`);
    } catch (error) {
      this.logger.error('Error unlinking OAuth provider', error);
      throw error;
    }
  }

  async getUserProviders(userId: string): Promise<any[]> {
    try {
      return await this.prisma.userProvider.findMany({
        where: { userId },
        select: {
          provider: true,
          email: true,
          createdAt: true,
        },
      });
    } catch (error) {
      this.logger.error('Error getting user providers', error);
      throw error;
    }
  }

  private async generateTokensForUser(user: any): Promise<any> {
    const payload = {
      sub: user.id,
      email: user.email,
      username: user.username,
      roles: user.roles?.map(ur => ur.role.name) || [],
    };

    const tokens = await this.tokenService.generateTokens(payload);

    // Store refresh token
    await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: tokens.refreshToken,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
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
        roles: user.roles?.map(ur => ur.role.name) || [],
      },
    };
  }

  isOAuthEnabled(provider: string): boolean {
    const enabledKey = `${provider.toUpperCase()}_OAUTH_ENABLED`;
    return this.configService.get<boolean>(enabledKey, false);
  }

  getOAuthConfig(provider: string): any {
    const upperProvider = provider.toUpperCase();
    return {
      clientId: this.configService.get<string>(`${upperProvider}_CLIENT_ID`),
      clientSecret: this.configService.get<string>(`${upperProvider}_CLIENT_SECRET`),
      callbackUrl: this.configService.get<string>(`${upperProvider}_CALLBACK_URL`),
    };
  }
}

