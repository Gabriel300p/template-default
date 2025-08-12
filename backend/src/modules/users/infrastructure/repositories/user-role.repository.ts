import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/shared/database/prisma.service';
import { UserRole, Role, Prisma } from '@prisma/client';

@Injectable()
export class UserRoleRepository {
  private readonly logger = new Logger(UserRoleRepository.name);

  constructor(private readonly prisma: PrismaService) {}

  async assignRole(userId: string, roleId: string): Promise<UserRole> {
    try {
      return await this.prisma.userRole.create({
        data: {
          userId,
          roleId,
        },
        include: {
          role: true,
          user: true,
        },
      });
    } catch (error) {
      this.logger.error(`Error assigning role ${roleId} to user ${userId}`, error);
      throw error;
    }
  }

  async removeRole(userId: string, roleId: string): Promise<UserRole> {
    try {
      return await this.prisma.userRole.delete({
        where: {
          userId_roleId: {
            userId,
            roleId,
          },
        },
        include: {
          role: true,
          user: true,
        },
      });
    } catch (error) {
      this.logger.error(`Error removing role ${roleId} from user ${userId}`, error);
      throw error;
    }
  }

  async getUserRoles(userId: string): Promise<UserRole[]> {
    try {
      return await this.prisma.userRole.findMany({
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
        orderBy: {
          createdAt: 'asc',
        },
      });
    } catch (error) {
      this.logger.error(`Error getting roles for user ${userId}`, error);
      throw error;
    }
  }

  async getRoleUsers(roleId: string): Promise<UserRole[]> {
    try {
      return await this.prisma.userRole.findMany({
        where: { roleId },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              username: true,
              firstName: true,
              lastName: true,
              avatar: true,
              isActive: true,
              isSuspended: true,
              createdAt: true,
              lastLogin: true,
            },
          },
          role: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    } catch (error) {
      this.logger.error(`Error getting users for role ${roleId}`, error);
      throw error;
    }
  }

  async hasRole(userId: string, roleId: string): Promise<boolean> {
    try {
      const userRole = await this.prisma.userRole.findUnique({
        where: {
          userId_roleId: {
            userId,
            roleId,
          },
        },
      });

      return !!userRole;
    } catch (error) {
      this.logger.error(`Error checking if user ${userId} has role ${roleId}`, error);
      return false;
    }
  }

  async hasRoleByName(userId: string, roleName: string): Promise<boolean> {
    try {
      const userRole = await this.prisma.userRole.findFirst({
        where: {
          userId,
          role: {
            name: roleName,
          },
        },
      });

      return !!userRole;
    } catch (error) {
      this.logger.error(`Error checking if user ${userId} has role ${roleName}`, error);
      return false;
    }
  }

  async updateUserRoles(userId: string, roleIds: string[]): Promise<void> {
    try {
      await this.prisma.$transaction(async (tx) => {
        // Remove existing roles
        await tx.userRole.deleteMany({
          where: { userId },
        });

        // Add new roles
        if (roleIds.length > 0) {
          const userRoles = roleIds.map(roleId => ({
            userId,
            roleId,
          }));

          await tx.userRole.createMany({
            data: userRoles,
          });
        }
      });
    } catch (error) {
      this.logger.error(`Error updating roles for user ${userId}`, error);
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
      this.logger.error(`Error getting permissions for user ${userId}`, error);
      throw error;
    }
  }

  async hasPermission(userId: string, permission: string): Promise<boolean> {
    try {
      const userRole = await this.prisma.userRole.findFirst({
        where: {
          userId,
          role: {
            permissions: {
              some: {
                permission: {
                  name: permission,
                },
              },
            },
          },
        },
      });

      return !!userRole;
    } catch (error) {
      this.logger.error(`Error checking if user ${userId} has permission ${permission}`, error);
      return false;
    }
  }

  async getAllRoles(): Promise<Role[]> {
    try {
      return await this.prisma.role.findMany({
        include: {
          permissions: {
            include: {
              permission: true,
            },
          },
          _count: {
            select: {
              users: true,
            },
          },
        },
        orderBy: {
          name: 'asc',
        },
      });
    } catch (error) {
      this.logger.error('Error getting all roles', error);
      throw error;
    }
  }

  async getRoleById(roleId: string): Promise<Role | null> {
    try {
      return await this.prisma.role.findUnique({
        where: { id: roleId },
        include: {
          permissions: {
            include: {
              permission: true,
            },
          },
          _count: {
            select: {
              users: true,
            },
          },
        },
      });
    } catch (error) {
      this.logger.error(`Error getting role ${roleId}`, error);
      throw error;
    }
  }

  async getRoleByName(roleName: string): Promise<Role | null> {
    try {
      return await this.prisma.role.findUnique({
        where: { name: roleName },
        include: {
          permissions: {
            include: {
              permission: true,
            },
          },
          _count: {
            select: {
              users: true,
            },
          },
        },
      });
    } catch (error) {
      this.logger.error(`Error getting role ${roleName}`, error);
      throw error;
    }
  }

  async countUsersByRole(roleId: string): Promise<number> {
    try {
      return await this.prisma.userRole.count({
        where: { roleId },
      });
    } catch (error) {
      this.logger.error(`Error counting users for role ${roleId}`, error);
      throw error;
    }
  }

  async getUserRoleHistory(userId: string): Promise<any[]> {
    try {
      // This would require an audit log table to track role changes
      // For now, we'll return current roles with assignment dates
      const userRoles = await this.prisma.userRole.findMany({
        where: { userId },
        include: {
          role: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return userRoles.map(ur => ({
        roleId: ur.roleId,
        roleName: ur.role.name,
        action: 'assigned',
        createdAt: ur.createdAt,
        createdBy: ur.createdBy,
      }));
    } catch (error) {
      this.logger.error(`Error getting role history for user ${userId}`, error);
      throw error;
    }
  }

  async bulkAssignRole(userIds: string[], roleId: string): Promise<void> {
    try {
      const userRoles = userIds.map(userId => ({
        userId,
        roleId,
      }));

      await this.prisma.userRole.createMany({
        data: userRoles,
        skipDuplicates: true,
      });
    } catch (error) {
      this.logger.error(`Error bulk assigning role ${roleId} to users`, error);
      throw error;
    }
  }

  async bulkRemoveRole(userIds: string[], roleId: string): Promise<void> {
    try {
      await this.prisma.userRole.deleteMany({
        where: {
          userId: {
            in: userIds,
          },
          roleId,
        },
      });
    } catch (error) {
      this.logger.error(`Error bulk removing role ${roleId} from users`, error);
      throw error;
    }
  }
}

