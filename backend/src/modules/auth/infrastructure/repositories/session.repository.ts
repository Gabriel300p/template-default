import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/shared/database/prisma.service';
import { Session, RefreshToken, Prisma } from '@prisma/client';

@Injectable()
export class SessionRepository {
  private readonly logger = new Logger(SessionRepository.name);

  constructor(private readonly prisma: PrismaService) {}

  // Session management
  async createSession(data: Prisma.SessionCreateInput): Promise<Session> {
    try {
      return await this.prisma.session.create({
        data,
      });
    } catch (error) {
      this.logger.error('Error creating session', error);
      throw error;
    }
  }

  async findSessionByToken(token: string): Promise<Session | null> {
    try {
      return await this.prisma.session.findUnique({
        where: { token },
        include: {
          user: true,
        },
      });
    } catch (error) {
      this.logger.error('Error finding session by token', error);
      throw error;
    }
  }

  async findUserSessions(userId: string): Promise<Session[]> {
    try {
      return await this.prisma.session.findMany({
        where: { 
          userId,
          isActive: true,
          expiresAt: {
            gt: new Date(),
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    } catch (error) {
      this.logger.error('Error finding user sessions', error);
      throw error;
    }
  }

  async deactivateSession(token: string): Promise<void> {
    try {
      await this.prisma.session.updateMany({
        where: { token },
        data: { isActive: false },
      });
    } catch (error) {
      this.logger.error('Error deactivating session', error);
      throw error;
    }
  }

  async deactivateUserSessions(userId: string): Promise<void> {
    try {
      await this.prisma.session.updateMany({
        where: { userId },
        data: { isActive: false },
      });
    } catch (error) {
      this.logger.error('Error deactivating user sessions', error);
      throw error;
    }
  }

  async cleanupExpiredSessions(): Promise<number> {
    try {
      const result = await this.prisma.session.deleteMany({
        where: {
          OR: [
            { expiresAt: { lt: new Date() } },
            { isActive: false },
          ],
        },
      });

      this.logger.log(`Cleaned up ${result.count} expired sessions`);
      return result.count;
    } catch (error) {
      this.logger.error('Error cleaning up expired sessions', error);
      throw error;
    }
  }

  // Refresh token management
  async createRefreshToken(data: Prisma.RefreshTokenCreateInput): Promise<RefreshToken> {
    try {
      return await this.prisma.refreshToken.create({
        data,
      });
    } catch (error) {
      this.logger.error('Error creating refresh token', error);
      throw error;
    }
  }

  async findRefreshToken(token: string): Promise<RefreshToken | null> {
    try {
      return await this.prisma.refreshToken.findUnique({
        where: { token },
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
    } catch (error) {
      this.logger.error('Error finding refresh token', error);
      throw error;
    }
  }

  async revokeRefreshToken(token: string): Promise<void> {
    try {
      await this.prisma.refreshToken.updateMany({
        where: { token },
        data: { isRevoked: true },
      });
    } catch (error) {
      this.logger.error('Error revoking refresh token', error);
      throw error;
    }
  }

  async revokeUserRefreshTokens(userId: string): Promise<void> {
    try {
      await this.prisma.refreshToken.updateMany({
        where: { userId },
        data: { isRevoked: true },
      });
    } catch (error) {
      this.logger.error('Error revoking user refresh tokens', error);
      throw error;
    }
  }

  async findUserRefreshTokens(userId: string): Promise<RefreshToken[]> {
    try {
      return await this.prisma.refreshToken.findMany({
        where: { 
          userId,
          isRevoked: false,
          expiresAt: {
            gt: new Date(),
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    } catch (error) {
      this.logger.error('Error finding user refresh tokens', error);
      throw error;
    }
  }

  async cleanupExpiredRefreshTokens(): Promise<number> {
    try {
      const result = await this.prisma.refreshToken.deleteMany({
        where: {
          OR: [
            { expiresAt: { lt: new Date() } },
            { isRevoked: true },
          ],
        },
      });

      this.logger.log(`Cleaned up ${result.count} expired refresh tokens`);
      return result.count;
    } catch (error) {
      this.logger.error('Error cleaning up expired refresh tokens', error);
      throw error;
    }
  }

  // Analytics and monitoring
  async getActiveSessionsCount(userId?: string): Promise<number> {
    try {
      return await this.prisma.session.count({
        where: {
          ...(userId && { userId }),
          isActive: true,
          expiresAt: {
            gt: new Date(),
          },
        },
      });
    } catch (error) {
      this.logger.error('Error getting active sessions count', error);
      throw error;
    }
  }

  async getSessionsByIpAddress(ipAddress: string): Promise<Session[]> {
    try {
      return await this.prisma.session.findMany({
        where: { 
          ipAddress,
          isActive: true,
          expiresAt: {
            gt: new Date(),
          },
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              username: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    } catch (error) {
      this.logger.error('Error getting sessions by IP address', error);
      throw error;
    }
  }

  async getRecentSessions(limit: number = 100): Promise<Session[]> {
    try {
      return await this.prisma.session.findMany({
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              username: true,
            },
          },
        },
      });
    } catch (error) {
      this.logger.error('Error getting recent sessions', error);
      throw error;
    }
  }
}

