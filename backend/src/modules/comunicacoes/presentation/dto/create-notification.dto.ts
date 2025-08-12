import { ApiProperty } from '@nestjs/swagger';
import { 
  IsEnum, 
  IsString, 
  IsOptional, 
  IsUUID, 
  IsObject,
  IsUrl,
  MaxLength,
  MinLength
} from 'class-validator';
import { NotificationType, NotificationPriority } from '@prisma/client';

export class CreateNotificationDto {
  @ApiProperty({
    description: 'Type of notification',
    enum: NotificationType,
    example: NotificationType.INFO,
  })
  @IsEnum(NotificationType)
  type: NotificationType;

  @ApiProperty({
    description: 'Priority level',
    enum: NotificationPriority,
    example: NotificationPriority.NORMAL,
    required: false,
    default: NotificationPriority.NORMAL,
  })
  @IsOptional()
  @IsEnum(NotificationPriority)
  priority?: NotificationPriority = NotificationPriority.NORMAL;

  @ApiProperty({
    description: 'Target user ID',
    example: 'clp1234567890abcdef',
  })
  @IsUUID()
  userId: string;

  @ApiProperty({
    description: 'Notification title',
    example: 'New message received',
    maxLength: 100,
  })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  title: string;

  @ApiProperty({
    description: 'Notification message',
    example: 'You have received a new message from John Doe.',
    maxLength: 500,
  })
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  message: string;

  @ApiProperty({
    description: 'Action URL (optional)',
    example: 'https://app.example.com/messages/123',
    required: false,
  })
  @IsOptional()
  @IsUrl()
  actionUrl?: string;

  @ApiProperty({
    description: 'Action button text (optional)',
    example: 'View Message',
    required: false,
    maxLength: 50,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  actionText?: string;

  @ApiProperty({
    description: 'Icon for the notification (optional)',
    example: 'message',
    required: false,
    maxLength: 50,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  icon?: string;

  @ApiProperty({
    description: 'Additional metadata (JSON object)',
    example: { category: 'messages', senderId: 'user123' },
    required: false,
  })
  @IsOptional()
  @IsObject()
  metadata?: any;
}

