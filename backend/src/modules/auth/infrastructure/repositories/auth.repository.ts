import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/shared/database/prisma.service';
import { User, Prisma } from '@prisma/client';

@Injectable()
export class AuthRepository {
  private readonly logger = new Logger(AuthRepository.name);

  constructor(private readonly prisma: PrismaService) {}

  async findUserByEmail(email: string): Promise<User | null> {
    try {
      return await this.prisma.user.findUnique({
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
    } catch (error) {
      this.logger.error('Error finding user by email', error);
      throw error;
    }
  }

  async findUserById(id: string): Promise<User | null> {
    try {
      return await this.prisma.user.findUnique({
        where: { id },
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
    } catch (error) {
      this.logger.error('Error finding user by ID', error);
      throw error;
    }
  }

  async findUserByUsername(username: string): Promise<User | null> {
    try {
      return await this.prisma.user.findUnique({
        where: { username },
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
    } catch (error) {
      this.logger.error('Error finding user by username', error);
      throw error;
    }
  }

  async createUser(data: Prisma.UserCreateInput): Promise<User> {
    try {
      return await this.prisma.user.create({
        data,
        include: {
          roles: {
            include: {
              role: true,
            },
          },
        },
      });
    } catch (error) {
      this.logger.error('Error creating user', error);
      throw error;
    }
  }

  async updateUser(id: string, data: Prisma.UserUpdateInput): Promise<User> {
    try {
      return await this.prisma.user.update({
        where: { id },
        data,
        include: {
          roles: {
            include: {
              role: true,
            },
          },
        },
      });
    } catch (error) {
      this.logger.error('Error updating user', error);
      throw error;
    }
  }

  async updateLastLogin(id: string): Promise<void> {
    try {
      await this.prisma.user.update({
        where: { id },
        data: { lastLogin: new Date() },
      });
    } catch (error) {
      this.logger.error('Error updating last login', error);
      throw error;
    }
  }

  async assignRoleToUser(userId: string, roleId: string): Promise<void> {
    try {
      await this.prisma.userRole.create({
        data: {
          userId,
          roleId,
        },
      });
    } catch (error) {
      this.logger.error('Error assigning role to user', error);
      throw error;
    }
  }

  async removeRoleFromUser(userId: string, roleId: string): Promise<void> {
    try {
      await this.prisma.userRole.deleteMany({
        where: {
          userId,
          roleId,
        },
      });
    } catch (error) {
      this.logger.error('Error removing role from user', error);
      throw error;
    }
  }

  async getUserRoles(userId: string): Promise<string[]> {
    try {
      const userRoles = await this.prisma.userRole.findMany({
        where: { userId },
        include: {
          role: true,
        },
      });

      return userRoles.map(ur => ur.role.name);
    } catch (error) {
      this.logger.error('Error getting user roles', error);
      throw error;
    }
  }

  async getUserPermissions(userId: string): Promise<string[]> {
    try {
      const userRoles = await this.prisma.userRole.findMany({
        where: { userId },
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
      });

      const permissions = userRoles.flatMap(ur => 
        ur.role.permissions.map(rp => rp.permission.name)
      );

      return [...new Set(permissions)]; // Remove duplicates
    } catch (error) {
      this.logger.error('Error getting user permissions', error);
      throw error;
    }
  }

  async checkUserExists(email: string, username?: string): Promise<boolean> {
    try {
      const user = await this.prisma.user.findFirst({
        where: {
          OR: [
            { email },
            ...(username ? [{ username }] : []),
          ],
        },
      });

      return !!user;
    } catch (error) {
      this.logger.error('Error checking if user exists', error);
      throw error;
    }
  }

  async deactivateUser(id: string): Promise<void> {
    try {
      await this.prisma.user.update({
        where: { id },
        data: { isActive: false },
      });
    } catch (error) {
      this.logger.error('Error deactivating user', error);
      throw error;
    }
  }

  async activateUser(id: string): Promise<void> {
    try {
      await this.prisma.user.update({
        where: { id },
        data: { isActive: true },
      });
    } catch (error) {
      this.logger.error('Error activating user', error);
      throw error;
    }
  }

  async suspendUser(id: string): Promise<void> {
    try {
      await this.prisma.user.update({
        where: { id },
        data: { isSuspended: true },
      });
    } catch (error) {
      this.logger.error('Error suspending user', error);
      throw error;
    }
  }

  async unsuspendUser(id: string): Promise<void> {
    try {
      await this.prisma.user.update({
        where: { id },
        data: { isSuspended: false },
      });
    } catch (error) {
      this.logger.error('Error unsuspending user', error);
      throw error;
    }
  }
}

