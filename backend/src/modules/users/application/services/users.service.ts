import { 
  Injectable, 
  NotFoundException, 
  ConflictException, 
  BadRequestException,
  Logger 
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@/shared/database/prisma.service';
import { PasswordService } from '@/modules/auth/application/services/password.service';
import { CreateUserDto } from '../../presentation/dto/create-user.dto';
import { UpdateUserDto, AdminUpdateUserDto } from '../../presentation/dto/update-user.dto';
import { UserQueryDto } from '../../presentation/dto/user-query.dto';
import { UserResponseDto, UserListResponseDto, UserStatsResponseDto } from '../../presentation/dto/user-response.dto';
import { User, Prisma } from '@prisma/client';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly passwordService: PasswordService,
    private readonly configService: ConfigService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    try {
      // Check if user already exists
      const existingUser = await this.prisma.user.findFirst({
        where: {
          OR: [
            { email: createUserDto.email },
            ...(createUserDto.username ? [{ username: createUserDto.username }] : []),
          ],
        },
      });

      if (existingUser) {
        if (existingUser.email === createUserDto.email) {
          throw new ConflictException('Email already exists');
        }
        if (existingUser.username === createUserDto.username) {
          throw new ConflictException('Username already exists');
        }
      }

      // Hash password if provided
      let hashedPassword: string | undefined;
      if (createUserDto.password) {
        hashedPassword = await this.passwordService.hashPassword(createUserDto.password);
      }

      // Create user
      const user = await this.prisma.user.create({
        data: {
          email: createUserDto.email,
          username: createUserDto.username,
          firstName: createUserDto.firstName,
          lastName: createUserDto.lastName,
          password: hashedPassword,
          phone: createUserDto.phone,
          bio: createUserDto.bio,
          isActive: createUserDto.isActive ?? true,
          emailVerified: this.configService.get<boolean>('EMAIL_VERIFICATION_ENABLED') ? null : new Date(),
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
        },
      });

      // Assign roles if provided
      if (createUserDto.roleIds && createUserDto.roleIds.length > 0) {
        await this.assignRoles(user.id, createUserDto.roleIds);
      } else {
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
      }

      this.logger.log(`User created: ${user.id}`);
      return this.transformToResponseDto(user);
    } catch (error) {
      this.logger.error('Error creating user', error);
      throw error;
    }
  }

  async findAll(query: UserQueryDto): Promise<UserListResponseDto> {
    try {
      const { page, limit, search, isActive, isSuspended, emailVerified, role, sortBy, sortOrder } = query;
      
      const skip = (page - 1) * limit;
      
      // Build where clause
      const where: Prisma.UserWhereInput = {
        ...(search && {
          OR: [
            { email: { contains: search, mode: 'insensitive' } },
            { username: { contains: search, mode: 'insensitive' } },
            { firstName: { contains: search, mode: 'insensitive' } },
            { lastName: { contains: search, mode: 'insensitive' } },
          ],
        }),
        ...(isActive !== undefined && { isActive }),
        ...(isSuspended !== undefined && { isSuspended }),
        ...(emailVerified !== undefined && {
          emailVerified: emailVerified ? { not: null } : null,
        }),
        ...(role && {
          roles: {
            some: {
              role: {
                name: role,
              },
            },
          },
        }),
      };

      // Get total count
      const total = await this.prisma.user.count({ where });

      // Get users
      const users = await this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
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

      const totalPages = Math.ceil(total / limit);

      return {
        users: users.map(user => this.transformToResponseDto(user)),
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      };
    } catch (error) {
      this.logger.error('Error finding users', error);
      throw error;
    }
  }

  async findOne(id: string): Promise<UserResponseDto> {
    try {
      const user = await this.prisma.user.findUnique({
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

      if (!user) {
        throw new NotFoundException('User not found');
      }

      return this.transformToResponseDto(user);
    } catch (error) {
      this.logger.error(`Error finding user ${id}`, error);
      throw error;
    }
  }

  async findByEmail(email: string): Promise<UserResponseDto> {
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
        throw new NotFoundException('User not found');
      }

      return this.transformToResponseDto(user);
    } catch (error) {
      this.logger.error(`Error finding user by email ${email}`, error);
      throw error;
    }
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<UserResponseDto> {
    try {
      // Check if user exists
      const existingUser = await this.prisma.user.findUnique({
        where: { id },
      });

      if (!existingUser) {
        throw new NotFoundException('User not found');
      }

      // Check for conflicts if updating email or username
      if (updateUserDto.email || updateUserDto.username) {
        const conflictUser = await this.prisma.user.findFirst({
          where: {
            AND: [
              { id: { not: id } },
              {
                OR: [
                  ...(updateUserDto.email ? [{ email: updateUserDto.email }] : []),
                  ...(updateUserDto.username ? [{ username: updateUserDto.username }] : []),
                ],
              },
            ],
          },
        });

        if (conflictUser) {
          if (conflictUser.email === updateUserDto.email) {
            throw new ConflictException('Email already exists');
          }
          if (conflictUser.username === updateUserDto.username) {
            throw new ConflictException('Username already exists');
          }
        }
      }

      // Update user
      const user = await this.prisma.user.update({
        where: { id },
        data: {
          ...updateUserDto,
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
        },
      });

      // Update roles if provided
      if (updateUserDto.roleIds) {
        await this.updateUserRoles(id, updateUserDto.roleIds);
      }

      this.logger.log(`User updated: ${id}`);
      return this.transformToResponseDto(user);
    } catch (error) {
      this.logger.error(`Error updating user ${id}`, error);
      throw error;
    }
  }

  async adminUpdate(id: string, adminUpdateUserDto: AdminUpdateUserDto): Promise<UserResponseDto> {
    try {
      return await this.update(id, adminUpdateUserDto);
    } catch (error) {
      this.logger.error(`Error admin updating user ${id}`, error);
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      await this.prisma.user.delete({
        where: { id },
      });

      this.logger.log(`User deleted: ${id}`);
    } catch (error) {
      this.logger.error(`Error deleting user ${id}`, error);
      throw error;
    }
  }

  async activate(id: string): Promise<UserResponseDto> {
    try {
      const user = await this.prisma.user.update({
        where: { id },
        data: { isActive: true },
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

      this.logger.log(`User activated: ${id}`);
      return this.transformToResponseDto(user);
    } catch (error) {
      this.logger.error(`Error activating user ${id}`, error);
      throw error;
    }
  }

  async deactivate(id: string): Promise<UserResponseDto> {
    try {
      const user = await this.prisma.user.update({
        where: { id },
        data: { isActive: false },
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

      this.logger.log(`User deactivated: ${id}`);
      return this.transformToResponseDto(user);
    } catch (error) {
      this.logger.error(`Error deactivating user ${id}`, error);
      throw error;
    }
  }

  async suspend(id: string): Promise<UserResponseDto> {
    try {
      const user = await this.prisma.user.update({
        where: { id },
        data: { isSuspended: true },
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

      // Revoke all sessions and refresh tokens
      await this.prisma.session.updateMany({
        where: { userId: id },
        data: { isActive: false },
      });

      await this.prisma.refreshToken.updateMany({
        where: { userId: id },
        data: { isRevoked: true },
      });

      this.logger.log(`User suspended: ${id}`);
      return this.transformToResponseDto(user);
    } catch (error) {
      this.logger.error(`Error suspending user ${id}`, error);
      throw error;
    }
  }

  async unsuspend(id: string): Promise<UserResponseDto> {
    try {
      const user = await this.prisma.user.update({
        where: { id },
        data: { isSuspended: false },
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

      this.logger.log(`User unsuspended: ${id}`);
      return this.transformToResponseDto(user);
    } catch (error) {
      this.logger.error(`Error unsuspending user ${id}`, error);
      throw error;
    }
  }

  async getStats(): Promise<UserStatsResponseDto> {
    try {
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const startOfWeek = new Date(startOfDay.getTime() - (startOfDay.getDay() * 24 * 60 * 60 * 1000));
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const [
        totalUsers,
        activeUsers,
        suspendedUsers,
        verifiedUsers,
        newUsersToday,
        newUsersThisWeek,
        newUsersThisMonth,
      ] = await Promise.all([
        this.prisma.user.count(),
        this.prisma.user.count({ where: { isActive: true } }),
        this.prisma.user.count({ where: { isSuspended: true } }),
        this.prisma.user.count({ where: { emailVerified: { not: null } } }),
        this.prisma.user.count({ where: { createdAt: { gte: startOfDay } } }),
        this.prisma.user.count({ where: { createdAt: { gte: startOfWeek } } }),
        this.prisma.user.count({ where: { createdAt: { gte: startOfMonth } } }),
      ]);

      return {
        totalUsers,
        activeUsers,
        suspendedUsers,
        verifiedUsers,
        newUsersToday,
        newUsersThisWeek,
        newUsersThisMonth,
      };
    } catch (error) {
      this.logger.error('Error getting user stats', error);
      throw error;
    }
  }

  private async assignRoles(userId: string, roleIds: string[]): Promise<void> {
    try {
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
    } catch (error) {
      this.logger.error(`Error assigning roles to user ${userId}`, error);
      throw error;
    }
  }

  private async updateUserRoles(userId: string, roleIds: string[]): Promise<void> {
    try {
      await this.assignRoles(userId, roleIds);
    } catch (error) {
      this.logger.error(`Error updating roles for user ${userId}`, error);
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

