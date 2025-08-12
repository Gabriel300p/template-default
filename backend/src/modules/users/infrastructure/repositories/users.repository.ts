import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/shared/database/prisma.service';
import { User, Prisma } from '@prisma/client';

@Injectable()
export class UsersRepository {
  private readonly logger = new Logger(UsersRepository.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.UserCreateInput): Promise<User> {
    try {
      return await this.prisma.user.create({
        data,
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
      this.logger.error('Error creating user', error);
      throw error;
    }
  }

  async findById(id: string): Promise<User | null> {
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
      this.logger.error(`Error finding user by ID ${id}`, error);
      throw error;
    }
  }

  async findByEmail(email: string): Promise<User | null> {
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
      this.logger.error(`Error finding user by email ${email}`, error);
      throw error;
    }
  }

  async findByUsername(username: string): Promise<User | null> {
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
      this.logger.error(`Error finding user by username ${username}`, error);
      throw error;
    }
  }

  async findMany(params: {
    skip?: number;
    take?: number;
    where?: Prisma.UserWhereInput;
    orderBy?: Prisma.UserOrderByWithRelationInput;
  }): Promise<User[]> {
    try {
      const { skip, take, where, orderBy } = params;
      return await this.prisma.user.findMany({
        skip,
        take,
        where,
        orderBy,
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
      this.logger.error('Error finding users', error);
      throw error;
    }
  }

  async count(where?: Prisma.UserWhereInput): Promise<number> {
    try {
      return await this.prisma.user.count({ where });
    } catch (error) {
      this.logger.error('Error counting users', error);
      throw error;
    }
  }

  async update(id: string, data: Prisma.UserUpdateInput): Promise<User> {
    try {
      return await this.prisma.user.update({
        where: { id },
        data,
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
      this.logger.error(`Error updating user ${id}`, error);
      throw error;
    }
  }

  async delete(id: string): Promise<User> {
    try {
      return await this.prisma.user.delete({
        where: { id },
      });
    } catch (error) {
      this.logger.error(`Error deleting user ${id}`, error);
      throw error;
    }
  }

  async exists(where: Prisma.UserWhereInput): Promise<boolean> {
    try {
      const user = await this.prisma.user.findFirst({ where });
      return !!user;
    } catch (error) {
      this.logger.error('Error checking if user exists', error);
      throw error;
    }
  }

  async findByEmailOrUsername(emailOrUsername: string): Promise<User | null> {
    try {
      return await this.prisma.user.findFirst({
        where: {
          OR: [
            { email: emailOrUsername },
            { username: emailOrUsername },
          ],
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
    } catch (error) {
      this.logger.error(`Error finding user by email or username ${emailOrUsername}`, error);
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
      this.logger.error(`Error updating last login for user ${id}`, error);
      throw error;
    }
  }

  async activate(id: string): Promise<User> {
    try {
      return await this.prisma.user.update({
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
    } catch (error) {
      this.logger.error(`Error activating user ${id}`, error);
      throw error;
    }
  }

  async deactivate(id: string): Promise<User> {
    try {
      return await this.prisma.user.update({
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
    } catch (error) {
      this.logger.error(`Error deactivating user ${id}`, error);
      throw error;
    }
  }

  async suspend(id: string): Promise<User> {
    try {
      return await this.prisma.user.update({
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
    } catch (error) {
      this.logger.error(`Error suspending user ${id}`, error);
      throw error;
    }
  }

  async unsuspend(id: string): Promise<User> {
    try {
      return await this.prisma.user.update({
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
    } catch (error) {
      this.logger.error(`Error unsuspending user ${id}`, error);
      throw error;
    }
  }

  async verifyEmail(id: string): Promise<User> {
    try {
      return await this.prisma.user.update({
        where: { id },
        data: { emailVerified: new Date() },
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
      this.logger.error(`Error verifying email for user ${id}`, error);
      throw error;
    }
  }

  async getStats(): Promise<any> {
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

  async search(searchTerm: string, limit: number = 10): Promise<User[]> {
    try {
      return await this.prisma.user.findMany({
        where: {
          OR: [
            { email: { contains: searchTerm, mode: 'insensitive' } },
            { username: { contains: searchTerm, mode: 'insensitive' } },
            { firstName: { contains: searchTerm, mode: 'insensitive' } },
            { lastName: { contains: searchTerm, mode: 'insensitive' } },
          ],
        },
        take: limit,
        include: {
          roles: {
            include: {
              role: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    } catch (error) {
      this.logger.error(`Error searching users with term ${searchTerm}`, error);
      throw error;
    }
  }
}

