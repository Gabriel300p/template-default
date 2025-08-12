import { 
  Injectable, 
  NotFoundException, 
  ConflictException, 
  BadRequestException,
  Logger 
} from '@nestjs/common';
import { PrismaService } from '@/shared/database/prisma.service';
import { UpdateUserProfileDto } from '../../presentation/dto/update-user.dto';
import { UserResponseDto } from '../../presentation/dto/user-response.dto';

@Injectable()
export class UserProfileService {
  private readonly logger = new Logger(UserProfileService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getProfile(userId: string): Promise<UserResponseDto> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
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
          providers: {
            select: {
              provider: true,
              email: true,
              createdAt: true,
            },
          },
        },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      return this.transformToResponseDto(user);
    } catch (error) {
      this.logger.error(`Error getting profile for user ${userId}`, error);
      throw error;
    }
  }

  async updateProfile(userId: string, updateProfileDto: UpdateUserProfileDto): Promise<UserResponseDto> {
    try {
      // Check if user exists
      const existingUser = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!existingUser) {
        throw new NotFoundException('User not found');
      }

      // Check for conflicts if updating email or username
      if (updateProfileDto.email || updateProfileDto.username) {
        const conflictUser = await this.prisma.user.findFirst({
          where: {
            AND: [
              { id: { not: userId } },
              {
                OR: [
                  ...(updateProfileDto.email ? [{ email: updateProfileDto.email }] : []),
                  ...(updateProfileDto.username ? [{ username: updateProfileDto.username }] : []),
                ],
              },
            ],
          },
        });

        if (conflictUser) {
          if (conflictUser.email === updateProfileDto.email) {
            throw new ConflictException('Email already exists');
          }
          if (conflictUser.username === updateProfileDto.username) {
            throw new ConflictException('Username already exists');
          }
        }
      }

      // Update user profile
      const user = await this.prisma.user.update({
        where: { id: userId },
        data: {
          ...updateProfileDto,
          updatedAt: new Date(),
        },
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
          providers: {
            select: {
              provider: true,
              email: true,
              createdAt: true,
            },
          },
        },
      });

      this.logger.log(`Profile updated for user: ${userId}`);
      return this.transformToResponseDto(user);
    } catch (error) {
      this.logger.error(`Error updating profile for user ${userId}`, error);
      throw error;
    }
  }

  async uploadAvatar(userId: string, avatarUrl: string): Promise<UserResponseDto> {
    try {
      const user = await this.prisma.user.update({
        where: { id: userId },
        data: { 
          avatar: avatarUrl,
          updatedAt: new Date(),
        },
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
          providers: {
            select: {
              provider: true,
              email: true,
              createdAt: true,
            },
          },
        },
      });

      this.logger.log(`Avatar updated for user: ${userId}`);
      return this.transformToResponseDto(user);
    } catch (error) {
      this.logger.error(`Error uploading avatar for user ${userId}`, error);
      throw error;
    }
  }

  async removeAvatar(userId: string): Promise<UserResponseDto> {
    try {
      const user = await this.prisma.user.update({
        where: { id: userId },
        data: { 
          avatar: null,
          updatedAt: new Date(),
        },
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
          providers: {
            select: {
              provider: true,
              email: true,
              createdAt: true,
            },
          },
        },
      });

      this.logger.log(`Avatar removed for user: ${userId}`);
      return this.transformToResponseDto(user);
    } catch (error) {
      this.logger.error(`Error removing avatar for user ${userId}`, error);
      throw error;
    }
  }

  async getProfileSummary(userId: string): Promise<any> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: {
          roles: {
            include: {
              role: true,
            },
          },
          sessions: {
            where: {
              isActive: true,
              expiresAt: {
                gt: new Date(),
              },
            },
            orderBy: {
              createdAt: 'desc',
            },
            take: 5,
          },
          providers: {
            select: {
              provider: true,
              email: true,
              createdAt: true,
            },
          },
        },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Get recent activity (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const recentSessions = await this.prisma.session.count({
        where: {
          userId,
          createdAt: {
            gte: thirtyDaysAgo,
          },
        },
      });

      return {
        user: this.transformToResponseDto(user),
        summary: {
          totalSessions: user.sessions.length,
          recentSessions,
          linkedProviders: user.providers.length,
          accountAge: Math.floor((new Date().getTime() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24)),
          lastActivity: user.lastLogin,
        },
        recentSessions: user.sessions.map(session => ({
          id: session.id,
          ipAddress: session.ipAddress,
          userAgent: session.userAgent,
          createdAt: session.createdAt,
          expiresAt: session.expiresAt,
        })),
        linkedProviders: user.providers,
      };
    } catch (error) {
      this.logger.error(`Error getting profile summary for user ${userId}`, error);
      throw error;
    }
  }

  async verifyEmail(userId: string): Promise<UserResponseDto> {
    try {
      const user = await this.prisma.user.update({
        where: { id: userId },
        data: { 
          emailVerified: new Date(),
          updatedAt: new Date(),
        },
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
          providers: {
            select: {
              provider: true,
              email: true,
              createdAt: true,
            },
          },
        },
      });

      this.logger.log(`Email verified for user: ${userId}`);
      return this.transformToResponseDto(user);
    } catch (error) {
      this.logger.error(`Error verifying email for user ${userId}`, error);
      throw error;
    }
  }

  async getActivityLog(userId: string, limit: number = 50): Promise<any[]> {
    try {
      // Get recent sessions
      const sessions = await this.prisma.session.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: limit,
        select: {
          id: true,
          ipAddress: true,
          userAgent: true,
          createdAt: true,
          isActive: true,
        },
      });

      // Get audit logs if available
      const auditLogs = await this.prisma.auditLog.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: limit,
        select: {
          id: true,
          action: true,
          resource: true,
          resourceId: true,
          ipAddress: true,
          userAgent: true,
          createdAt: true,
          metadata: true,
        },
      });

      // Combine and sort by date
      const activities = [
        ...sessions.map(session => ({
          type: 'session',
          action: session.isActive ? 'login' : 'logout',
          details: {
            ipAddress: session.ipAddress,
            userAgent: session.userAgent,
          },
          createdAt: session.createdAt,
        })),
        ...auditLogs.map(log => ({
          type: 'audit',
          action: log.action,
          resource: log.resource,
          resourceId: log.resourceId,
          details: {
            ipAddress: log.ipAddress,
            userAgent: log.userAgent,
            metadata: log.metadata,
          },
          createdAt: log.createdAt,
        })),
      ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, limit);

      return activities;
    } catch (error) {
      this.logger.error(`Error getting activity log for user ${userId}`, error);
      throw error;
    }
  }

  private transformToResponseDto(user: any): UserResponseDto {
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      avatar: user.avatar,
      bio: user.bio,
      phone: user.phone,
      emailVerified: !!user.emailVerified,
      isActive: user.isActive,
      isSuspended: user.isSuspended,
      roles: user.roles?.map(ur => ur.role.name) || [],
      permissions: user.roles?.flatMap(ur => 
        ur.role.permissions?.map(rp => rp.permission.name) || []
      ) || [],
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      lastLogin: user.lastLogin,
    };
  }
}

