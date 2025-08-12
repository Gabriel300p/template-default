import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';

// Services
import { NotificationService, NotificationResponseDto } from '../../application/services/notification.service';

// DTOs
import { CreateNotificationDto } from '../dto/create-notification.dto';

// Guards
import { JwtAuthGuard } from '@/modules/auth/presentation/guards/jwt-auth.guard';

// Decorators
import { CurrentUser } from '@/shared/common/decorators/current-user.decorator';
import { Permissions } from '@/shared/common/decorators/permissions.decorator';

// Types
import { NotificationType, NotificationPriority } from '@prisma/client';

@ApiTags('Notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class NotificationController {
  private readonly logger = new Logger(NotificationController.name);

  constructor(private readonly notificationService: NotificationService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Permissions('notifications:create')
  @Throttle({ default: { limit: 20, ttl: 60000 } }) // 20 notifications per minute
  @ApiOperation({ summary: 'Create a new notification' })
  @ApiResponse({
    status: 201,
    description: 'Notification created successfully',
    type: NotificationResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid notification data',
  })
  @ApiResponse({
    status: 404,
    description: 'Target user not found',
  })
  @ApiResponse({
    status: 403,
    description: 'Insufficient permissions',
  })
  async create(
    @Body() createNotificationDto: CreateNotificationDto,
    @CurrentUser() currentUser: any,
  ): Promise<NotificationResponseDto> {
    try {
      this.logger.log(`Creating notification for user ${createNotificationDto.userId} by ${currentUser.id}`);
      return await this.notificationService.create(createNotificationDto);
    } catch (error) {
      this.logger.error('Error creating notification', error);
      throw error;
    }
  }

  @Get()
  @ApiOperation({ summary: 'Get current user notifications' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  @ApiQuery({ name: 'type', required: false, enum: NotificationType, description: 'Notification type' })
  @ApiQuery({ name: 'isRead', required: false, type: Boolean, description: 'Filter by read status' })
  @ApiQuery({ name: 'priority', required: false, enum: NotificationPriority, description: 'Filter by priority' })
  @ApiResponse({
    status: 200,
    description: 'Notifications retrieved successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async findUserNotifications(
    @CurrentUser() user: any,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('type') type?: NotificationType,
    @Query('isRead') isRead?: boolean,
    @Query('priority') priority?: NotificationPriority,
  ): Promise<any> {
    try {
      return await this.notificationService.findUserNotifications(user.id, {
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
        type,
        isRead,
        priority,
      });
    } catch (error) {
      this.logger.error(`Error retrieving notifications for user ${user.id}`, error);
      throw error;
    }
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get current user notification statistics' })
  @ApiResponse({
    status: 200,
    description: 'Notification statistics retrieved successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async getStats(@CurrentUser() user: any): Promise<any> {
    try {
      return await this.notificationService.getNotificationStats(user.id);
    } catch (error) {
      this.logger.error(`Error retrieving notification stats for user ${user.id}`, error);
      throw error;
    }
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Get unread notification count for current user' })
  @ApiResponse({
    status: 200,
    description: 'Unread count retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        count: { type: 'number', example: 5 },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async getUnreadCount(@CurrentUser() user: any): Promise<{ count: number }> {
    try {
      const count = await this.notificationService.getUnreadCount(user.id);
      return { count };
    } catch (error) {
      this.logger.error(`Error getting unread count for user ${user.id}`, error);
      throw error;
    }
  }

  @Get('admin')
  @Permissions('notifications:list')
  @ApiOperation({ summary: 'Get all notifications (admin only)' })
  @ApiQuery({ name: 'userId', required: false, type: String, description: 'Filter by user ID' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  @ApiQuery({ name: 'type', required: false, enum: NotificationType, description: 'Notification type' })
  @ApiQuery({ name: 'isRead', required: false, type: Boolean, description: 'Filter by read status' })
  @ApiQuery({ name: 'priority', required: false, enum: NotificationPriority, description: 'Filter by priority' })
  @ApiResponse({
    status: 200,
    description: 'Notifications retrieved successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Insufficient permissions',
  })
  async findAllNotifications(
    @Query('userId') userId?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('type') type?: NotificationType,
    @Query('isRead') isRead?: boolean,
    @Query('priority') priority?: NotificationPriority,
  ): Promise<any> {
    try {
      if (!userId) {
        throw new Error('userId is required for admin endpoint');
      }

      return await this.notificationService.findUserNotifications(userId, {
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
        type,
        isRead,
        priority,
      });
    } catch (error) {
      this.logger.error('Error retrieving notifications (admin)', error);
      throw error;
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get notification by ID' })
  @ApiParam({
    name: 'id',
    description: 'Notification ID',
    example: 'clp1234567890abcdef',
  })
  @ApiResponse({
    status: 200,
    description: 'Notification retrieved successfully',
    type: NotificationResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Notification not found',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async findOne(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ): Promise<NotificationResponseDto> {
    try {
      return await this.notificationService.findOne(id, user.id);
    } catch (error) {
      this.logger.error(`Error retrieving notification ${id}`, error);
      throw error;
    }
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark notification as read' })
  @ApiParam({
    name: 'id',
    description: 'Notification ID',
    example: 'clp1234567890abcdef',
  })
  @ApiResponse({
    status: 200,
    description: 'Notification marked as read',
    type: NotificationResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Notification not found',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async markAsRead(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ): Promise<NotificationResponseDto> {
    try {
      return await this.notificationService.markAsRead(id, user.id);
    } catch (error) {
      this.logger.error(`Error marking notification as read ${id}`, error);
      throw error;
    }
  }

  @Patch(':id/unread')
  @ApiOperation({ summary: 'Mark notification as unread' })
  @ApiParam({
    name: 'id',
    description: 'Notification ID',
    example: 'clp1234567890abcdef',
  })
  @ApiResponse({
    status: 200,
    description: 'Notification marked as unread',
    type: NotificationResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Notification not found',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async markAsUnread(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ): Promise<NotificationResponseDto> {
    try {
      return await this.notificationService.markAsUnread(id, user.id);
    } catch (error) {
      this.logger.error(`Error marking notification as unread ${id}`, error);
      throw error;
    }
  }

  @Patch('mark-all-read')
  @ApiOperation({ summary: 'Mark all notifications as read for current user' })
  @ApiResponse({
    status: 200,
    description: 'All notifications marked as read',
    schema: {
      type: 'object',
      properties: {
        count: { type: 'number', example: 10 },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async markAllAsRead(@CurrentUser() user: any): Promise<{ count: number }> {
    try {
      return await this.notificationService.markAllAsRead(user.id);
    } catch (error) {
      this.logger.error(`Error marking all notifications as read for user ${user.id}`, error);
      throw error;
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete notification' })
  @ApiParam({
    name: 'id',
    description: 'Notification ID',
    example: 'clp1234567890abcdef',
  })
  @ApiResponse({
    status: 200,
    description: 'Notification deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Notification not found',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async delete(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ): Promise<{ message: string }> {
    try {
      await this.notificationService.delete(id, user.id);
      return { message: 'Notification deleted successfully' };
    } catch (error) {
      this.logger.error(`Error deleting notification ${id}`, error);
      throw error;
    }
  }

  @Delete('clear-all')
  @ApiOperation({ summary: 'Delete all notifications for current user' })
  @ApiQuery({ name: 'onlyRead', required: false, type: Boolean, description: 'Delete only read notifications' })
  @ApiResponse({
    status: 200,
    description: 'Notifications deleted successfully',
    schema: {
      type: 'object',
      properties: {
        count: { type: 'number', example: 15 },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async deleteAll(
    @CurrentUser() user: any,
    @Query('onlyRead') onlyRead?: boolean,
  ): Promise<{ count: number }> {
    try {
      return await this.notificationService.deleteAll(user.id, onlyRead);
    } catch (error) {
      this.logger.error(`Error deleting all notifications for user ${user.id}`, error);
      throw error;
    }
  }

  // Convenience endpoints for creating common notification types
  @Post('info')
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @ApiOperation({ summary: 'Create info notification' })
  @ApiResponse({
    status: 201,
    description: 'Info notification created successfully',
    type: NotificationResponseDto,
  })
  async createInfoNotification(
    @Body() body: { userId: string; title: string; message: string; actionUrl?: string },
    @CurrentUser() currentUser: any,
  ): Promise<NotificationResponseDto> {
    try {
      return await this.notificationService.createInfoNotification(
        body.userId,
        body.title,
        body.message,
        body.actionUrl,
      );
    } catch (error) {
      this.logger.error('Error creating info notification', error);
      throw error;
    }
  }

  @Post('success')
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @ApiOperation({ summary: 'Create success notification' })
  @ApiResponse({
    status: 201,
    description: 'Success notification created successfully',
    type: NotificationResponseDto,
  })
  async createSuccessNotification(
    @Body() body: { userId: string; title: string; message: string; actionUrl?: string },
    @CurrentUser() currentUser: any,
  ): Promise<NotificationResponseDto> {
    try {
      return await this.notificationService.createSuccessNotification(
        body.userId,
        body.title,
        body.message,
        body.actionUrl,
      );
    } catch (error) {
      this.logger.error('Error creating success notification', error);
      throw error;
    }
  }

  @Post('warning')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @ApiOperation({ summary: 'Create warning notification' })
  @ApiResponse({
    status: 201,
    description: 'Warning notification created successfully',
    type: NotificationResponseDto,
  })
  async createWarningNotification(
    @Body() body: { userId: string; title: string; message: string; actionUrl?: string },
    @CurrentUser() currentUser: any,
  ): Promise<NotificationResponseDto> {
    try {
      return await this.notificationService.createWarningNotification(
        body.userId,
        body.title,
        body.message,
        body.actionUrl,
      );
    } catch (error) {
      this.logger.error('Error creating warning notification', error);
      throw error;
    }
  }

  @Post('error')
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @ApiOperation({ summary: 'Create error notification' })
  @ApiResponse({
    status: 201,
    description: 'Error notification created successfully',
    type: NotificationResponseDto,
  })
  async createErrorNotification(
    @Body() body: { userId: string; title: string; message: string; actionUrl?: string },
    @CurrentUser() currentUser: any,
  ): Promise<NotificationResponseDto> {
    try {
      return await this.notificationService.createErrorNotification(
        body.userId,
        body.title,
        body.message,
        body.actionUrl,
      );
    } catch (error) {
      this.logger.error('Error creating error notification', error);
      throw error;
    }
  }
}

