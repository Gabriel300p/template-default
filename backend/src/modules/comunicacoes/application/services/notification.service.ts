import { 
  Injectable, 
  NotFoundException, 
  Logger 
} from '@nestjs/common';
import { PrismaService } from '@/shared/database/prisma.service';
import { CreateNotificationDto } from '../../presentation/dto/create-notification.dto';
import { NotificationType, NotificationPriority, Prisma } from '@prisma/client';

export interface NotificationResponseDto {
  id: string;
  type: NotificationType;
  priority: NotificationPriority;
  userId: string;
  title: string;
  message: string;
  actionUrl?: string;
  actionText?: string;
  icon?: string;
  isRead: boolean;
  readAt?: Date;
  metadata?: any;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(createNotificationDto: CreateNotificationDto): Promise<NotificationResponseDto> {
    try {
      // Verify user exists
      const user = await this.prisma.user.findUnique({
        where: { id: createNotificationDto.userId },
        select: { id: true },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      const notification = await this.prisma.notification.create({
        data: {
          type: createNotificationDto.type,
          priority: createNotificationDto.priority,
          userId: createNotificationDto.userId,
          title: createNotificationDto.title,
          message: createNotificationDto.message,
          actionUrl: createNotificationDto.actionUrl,
          actionText: createNotificationDto.actionText,
          icon: createNotificationDto.icon,
          metadata: createNotificationDto.metadata,
        },
      });

      this.logger.log(`Notification created: ${notification.id} for user: ${createNotificationDto.userId}`);
      return this.transformToResponseDto(notification);
    } catch (error) {
      this.logger.error('Error creating notification', error);
      throw error;
    }
  }

  async findUserNotifications(
    userId: string,
    params?: {
      page?: number;
      limit?: number;
      type?: NotificationType;
      isRead?: boolean;
      priority?: NotificationPriority;
    }
  ): Promise<{
    notifications: NotificationResponseDto[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }> {
    try {
      const { page = 1, limit = 20, type, isRead, priority } = params || {};
      const skip = (page - 1) * limit;

      const where: Prisma.NotificationWhereInput = {
        userId,
        ...(type && { type }),
        ...(isRead !== undefined && { isRead }),
        ...(priority && { priority }),
      };

      const [notifications, total] = await Promise.all([
        this.prisma.notification.findMany({
          where,
          skip,
          take: limit,
          orderBy: [
            { priority: 'desc' },
            { createdAt: 'desc' },
          ],
        }),
        this.prisma.notification.count({ where }),
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        notifications: notifications.map(notif => this.transformToResponseDto(notif)),
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
      this.logger.error(`Error finding notifications for user ${userId}`, error);
      throw error;
    }
  }

  async findOne(id: string, userId?: string): Promise<NotificationResponseDto> {
    try {
      const where: Prisma.NotificationWhereUniqueInput = { id };
      
      const notification = await this.prisma.notification.findUnique({
        where,
      });

      if (!notification) {
        throw new NotFoundException('Notification not found');
      }

      // If userId provided, verify ownership
      if (userId && notification.userId !== userId) {
        throw new NotFoundException('Notification not found');
      }

      return this.transformToResponseDto(notification);
    } catch (error) {
      this.logger.error(`Error finding notification ${id}`, error);
      throw error;
    }
  }

  async markAsRead(id: string, userId?: string): Promise<NotificationResponseDto> {
    try {
      const where: Prisma.NotificationWhereUniqueInput = { id };

      // If userId provided, verify ownership
      if (userId) {
        const notification = await this.prisma.notification.findUnique({ where });
        if (!notification || notification.userId !== userId) {
          throw new NotFoundException('Notification not found');
        }
      }

      const notification = await this.prisma.notification.update({
        where,
        data: {
          isRead: true,
          readAt: new Date(),
          updatedAt: new Date(),
        },
      });

      this.logger.log(`Notification marked as read: ${id}`);
      return this.transformToResponseDto(notification);
    } catch (error) {
      this.logger.error(`Error marking notification as read ${id}`, error);
      throw error;
    }
  }

  async markAsUnread(id: string, userId?: string): Promise<NotificationResponseDto> {
    try {
      const where: Prisma.NotificationWhereUniqueInput = { id };

      // If userId provided, verify ownership
      if (userId) {
        const notification = await this.prisma.notification.findUnique({ where });
        if (!notification || notification.userId !== userId) {
          throw new NotFoundException('Notification not found');
        }
      }

      const notification = await this.prisma.notification.update({
        where,
        data: {
          isRead: false,
          readAt: null,
          updatedAt: new Date(),
        },
      });

      this.logger.log(`Notification marked as unread: ${id}`);
      return this.transformToResponseDto(notification);
    } catch (error) {
      this.logger.error(`Error marking notification as unread ${id}`, error);
      throw error;
    }
  }

  async markAllAsRead(userId: string): Promise<{ count: number }> {
    try {
      const result = await this.prisma.notification.updateMany({
        where: {
          userId,
          isRead: false,
        },
        data: {
          isRead: true,
          readAt: new Date(),
          updatedAt: new Date(),
        },
      });

      this.logger.log(`Marked ${result.count} notifications as read for user ${userId}`);
      return { count: result.count };
    } catch (error) {
      this.logger.error(`Error marking all notifications as read for user ${userId}`, error);
      throw error;
    }
  }

  async delete(id: string, userId?: string): Promise<void> {
    try {
      const where: Prisma.NotificationWhereUniqueInput = { id };

      // If userId provided, verify ownership
      if (userId) {
        const notification = await this.prisma.notification.findUnique({ where });
        if (!notification || notification.userId !== userId) {
          throw new NotFoundException('Notification not found');
        }
      }

      await this.prisma.notification.delete({ where });
      this.logger.log(`Notification deleted: ${id}`);
    } catch (error) {
      this.logger.error(`Error deleting notification ${id}`, error);
      throw error;
    }
  }

  async deleteAll(userId: string, onlyRead?: boolean): Promise<{ count: number }> {
    try {
      const where: Prisma.NotificationWhereInput = {
        userId,
        ...(onlyRead && { isRead: true }),
      };

      const result = await this.prisma.notification.deleteMany({ where });
      
      this.logger.log(`Deleted ${result.count} notifications for user ${userId}`);
      return { count: result.count };
    } catch (error) {
      this.logger.error(`Error deleting notifications for user ${userId}`, error);
      throw error;
    }
  }

  async getUnreadCount(userId: string): Promise<number> {
    try {
      return await this.prisma.notification.count({
        where: {
          userId,
          isRead: false,
        },
      });
    } catch (error) {
      this.logger.error(`Error getting unread count for user ${userId}`, error);
      throw error;
    }
  }

  async getNotificationStats(userId: string): Promise<{
    total: number;
    unread: number;
    byType: Record<NotificationType, number>;
    byPriority: Record<NotificationPriority, number>;
  }> {
    try {
      const [
        total,
        unread,
        byTypeStats,
        byPriorityStats,
      ] = await Promise.all([
        this.prisma.notification.count({ where: { userId } }),
        this.prisma.notification.count({ where: { userId, isRead: false } }),
        this.prisma.notification.groupBy({
          by: ['type'],
          where: { userId },
          _count: true,
        }),
        this.prisma.notification.groupBy({
          by: ['priority'],
          where: { userId },
          _count: true,
        }),
      ]);

      const byType = {} as Record<NotificationType, number>;
      for (const stat of byTypeStats) {
        byType[stat.type] = stat._count;
      }

      const byPriority = {} as Record<NotificationPriority, number>;
      for (const stat of byPriorityStats) {
        byPriority[stat.priority] = stat._count;
      }

      return {
        total,
        unread,
        byType,
        byPriority,
      };
    } catch (error) {
      this.logger.error(`Error getting notification stats for user ${userId}`, error);
      throw error;
    }
  }

  // Convenience methods for common notification types
  async createInfoNotification(userId: string, title: string, message: string, actionUrl?: string): Promise<NotificationResponseDto> {
    return this.create({
      type: NotificationType.INFO,
      priority: NotificationPriority.NORMAL,
      userId,
      title,
      message,
      actionUrl,
      icon: 'info',
    });
  }

  async createSuccessNotification(userId: string, title: string, message: string, actionUrl?: string): Promise<NotificationResponseDto> {
    return this.create({
      type: NotificationType.SUCCESS,
      priority: NotificationPriority.NORMAL,
      userId,
      title,
      message,
      actionUrl,
      icon: 'check-circle',
    });
  }

  async createWarningNotification(userId: string, title: string, message: string, actionUrl?: string): Promise<NotificationResponseDto> {
    return this.create({
      type: NotificationType.WARNING,
      priority: NotificationPriority.HIGH,
      userId,
      title,
      message,
      actionUrl,
      icon: 'warning',
    });
  }

  async createErrorNotification(userId: string, title: string, message: string, actionUrl?: string): Promise<NotificationResponseDto> {
    return this.create({
      type: NotificationType.ERROR,
      priority: NotificationPriority.URGENT,
      userId,
      title,
      message,
      actionUrl,
      icon: 'error',
    });
  }

  async cleanupOldNotifications(daysOld: number = 30): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      const result = await this.prisma.notification.deleteMany({
        where: {
          createdAt: {
            lt: cutoffDate,
          },
          isRead: true,
        },
      });

      this.logger.log(`Cleaned up ${result.count} old notifications`);
      return result.count;
    } catch (error) {
      this.logger.error('Error cleaning up old notifications', error);
      throw error;
    }
  }

  private transformToResponseDto(notification: any): NotificationResponseDto {
    return {
      id: notification.id,
      type: notification.type,
      priority: notification.priority,
      userId: notification.userId,
      title: notification.title,
      message: notification.message,
      actionUrl: notification.actionUrl,
      actionText: notification.actionText,
      icon: notification.icon,
      isRead: notification.isRead,
      readAt: notification.readAt,
      metadata: notification.metadata,
      createdAt: notification.createdAt,
      updatedAt: notification.updatedAt,
    };
  }
}

