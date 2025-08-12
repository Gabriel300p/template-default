import { 
  Injectable, 
  NotFoundException, 
  BadRequestException,
  Logger 
} from '@nestjs/common';
import { PrismaService } from '@/shared/database/prisma.service';

@Injectable()
export class UserRoleService {
  private readonly logger = new Logger(UserRoleService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getUserRoles(userId: string): Promise<any[]> {
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

      return userRoles.map(ur => ({
        id: ur.role.id,
        name: ur.role.name,
        description: ur.role.description,
        isSystem: ur.role.isSystem,
        permissions: ur.role.permissions.map(rp => ({
          id: rp.permission.id,
          name: rp.permission.name,
          description: rp.permission.description,
          resource: rp.permission.resource,
          action: rp.permission.action,
        })),
        assignedAt: ur.createdAt,
      }));
    } catch (error) {
      this.logger.error(`Error getting roles for user ${userId}`, error);
      throw error;
    }
  }

  async assignRole(userId: string, roleId: string): Promise<void> {
    try {
      // Check if user exists
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Check if role exists
      const role = await this.prisma.role.findUnique({
        where: { id: roleId },
      });

      if (!role) {
        throw new NotFoundException('Role not found');
      }

      // Check if user already has this role
      const existingUserRole = await this.prisma.userRole.findUnique({
        where: {
          userId_roleId: {
            userId,
            roleId,
          },
        },
      });

      if (existingUserRole) {
        throw new BadRequestException('User already has this role');
      }

      // Assign role
      await this.prisma.userRole.create({
        data: {
          userId,
          roleId,
        },
      });

      this.logger.log(`Role ${roleId} assigned to user ${userId}`);
    } catch (error) {
      this.logger.error(`Error assigning role ${roleId} to user ${userId}`, error);
      throw error;
    }
  }

  async removeRole(userId: string, roleId: string): Promise<void> {
    try {
      // Check if user has this role
      const userRole = await this.prisma.userRole.findUnique({
        where: {
          userId_roleId: {
            userId,
            roleId,
          },
        },
        include: {
          role: true,
        },
      });

      if (!userRole) {
        throw new NotFoundException('User does not have this role');
      }

      // Prevent removing the last role
      const userRolesCount = await this.prisma.userRole.count({
        where: { userId },
      });

      if (userRolesCount === 1) {
        throw new BadRequestException('Cannot remove the last role from user');
      }

      // Remove role
      await this.prisma.userRole.delete({
        where: {
          userId_roleId: {
            userId,
            roleId,
          },
        },
      });

      this.logger.log(`Role ${roleId} removed from user ${userId}`);
    } catch (error) {
      this.logger.error(`Error removing role ${roleId} from user ${userId}`, error);
      throw error;
    }
  }

  async updateUserRoles(userId: string, roleIds: string[]): Promise<void> {
    try {
      if (!roleIds || roleIds.length === 0) {
        throw new BadRequestException('At least one role must be assigned');
      }

      // Check if user exists
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Check if all roles exist
      const roles = await this.prisma.role.findMany({
        where: {
          id: {
            in: roleIds,
          },
        },
      });

      if (roles.length !== roleIds.length) {
        throw new BadRequestException('One or more roles not found');
      }

      // Remove existing roles
      await this.prisma.userRole.deleteMany({
        where: { userId },
      });

      // Add new roles
      const userRoles = roleIds.map(roleId => ({
        userId,
        roleId,
      }));

      await this.prisma.userRole.createMany({
        data: userRoles,
      });

      this.logger.log(`Roles updated for user ${userId}: ${roleIds.join(', ')}`);
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
      const userPermissions = await this.getUserPermissions(userId);
      return userPermissions.includes(permission);
    } catch (error) {
      this.logger.error(`Error checking permission ${permission} for user ${userId}`, error);
      return false;
    }
  }

  async hasRole(userId: string, roleName: string): Promise<boolean> {
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
      this.logger.error(`Error checking role ${roleName} for user ${userId}`, error);
      return false;
    }
  }

  async getAllRoles(): Promise<any[]> {
    try {
      const roles = await this.prisma.role.findMany({
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

      return roles.map(role => ({
        id: role.id,
        name: role.name,
        description: role.description,
        isSystem: role.isSystem,
        userCount: role._count.users,
        permissions: role.permissions.map(rp => ({
          id: rp.permission.id,
          name: rp.permission.name,
          description: rp.permission.description,
          resource: rp.permission.resource,
          action: rp.permission.action,
        })),
        createdAt: role.createdAt,
        updatedAt: role.updatedAt,
      }));
    } catch (error) {
      this.logger.error('Error getting all roles', error);
      throw error;
    }
  }

  async getRoleUsers(roleId: string): Promise<any[]> {
    try {
      const role = await this.prisma.role.findUnique({
        where: { id: roleId },
        include: {
          users: {
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
            },
          },
        },
      });

      if (!role) {
        throw new NotFoundException('Role not found');
      }

      return role.users.map(ur => ({
        ...ur.user,
        assignedAt: ur.createdAt,
      }));
    } catch (error) {
      this.logger.error(`Error getting users for role ${roleId}`, error);
      throw error;
    }
  }
}

