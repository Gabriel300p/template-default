import { ApiProperty } from '@nestjs/swagger';
import { CommunicationType, CommunicationStatus, CommunicationPriority } from '@prisma/client';

export class CommunicationResponseDto {
  @ApiProperty({
    description: 'Communication ID',
    example: 'clp1234567890abcdef',
  })
  id: string;

  @ApiProperty({
    description: 'Type of communication',
    enum: CommunicationType,
    example: CommunicationType.EMAIL,
  })
  type: CommunicationType;

  @ApiProperty({
    description: 'Current status',
    enum: CommunicationStatus,
    example: CommunicationStatus.SENT,
  })
  status: CommunicationStatus;

  @ApiProperty({
    description: 'Priority level',
    enum: CommunicationPriority,
    example: CommunicationPriority.NORMAL,
  })
  priority: CommunicationPriority;

  @ApiProperty({
    description: 'Target user ID',
    example: 'clp1234567890abcdef',
    nullable: true,
  })
  userId?: string;

  @ApiProperty({
    description: 'Target email address',
    example: 'user@example.com',
    nullable: true,
  })
  email?: string;

  @ApiProperty({
    description: 'Target phone number',
    example: '+1234567890',
    nullable: true,
  })
  phone?: string;

  @ApiProperty({
    description: 'Subject line',
    example: 'Welcome to our platform!',
    nullable: true,
  })
  subject?: string;

  @ApiProperty({
    description: 'Message content',
    example: 'Welcome to our platform! We are excited to have you on board.',
  })
  content: string;

  @ApiProperty({
    description: 'Number of retry attempts',
    example: 0,
  })
  retryCount: number;

  @ApiProperty({
    description: 'Maximum retry attempts',
    example: 3,
  })
  maxRetries: number;

  @ApiProperty({
    description: 'Error message if failed',
    example: 'SMTP connection failed',
    nullable: true,
  })
  errorMessage?: string;

  @ApiProperty({
    description: 'When the communication was sent',
    example: '2023-01-01T12:00:00.000Z',
    nullable: true,
  })
  sentAt?: Date;

  @ApiProperty({
    description: 'When the communication was delivered',
    example: '2023-01-01T12:01:00.000Z',
    nullable: true,
  })
  deliveredAt?: Date;

  @ApiProperty({
    description: 'When the communication was read/opened',
    example: '2023-01-01T12:05:00.000Z',
    nullable: true,
  })
  readAt?: Date;

  @ApiProperty({
    description: 'When the communication was scheduled for',
    example: '2023-01-01T12:00:00.000Z',
    nullable: true,
  })
  scheduledAt?: Date;

  @ApiProperty({
    description: 'Additional metadata',
    example: { templateId: 'welcome', campaign: 'onboarding' },
    nullable: true,
  })
  metadata?: any;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2023-01-01T11:59:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2023-01-01T12:01:00.000Z',
  })
  updatedAt: Date;
}

export class CommunicationListResponseDto {
  @ApiProperty({
    description: 'List of communications',
    type: [CommunicationResponseDto],
  })
  communications: CommunicationResponseDto[];

  @ApiProperty({
    description: 'Pagination metadata',
  })
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export class CommunicationStatsResponseDto {
  @ApiProperty({
    description: 'Total communications sent',
    example: 1000,
  })
  totalSent: number;

  @ApiProperty({
    description: 'Communications delivered',
    example: 950,
  })
  delivered: number;

  @ApiProperty({
    description: 'Communications failed',
    example: 50,
  })
  failed: number;

  @ApiProperty({
    description: 'Communications pending',
    example: 25,
  })
  pending: number;

  @ApiProperty({
    description: 'Communications scheduled',
    example: 10,
  })
  scheduled: number;

  @ApiProperty({
    description: 'Delivery rate percentage',
    example: 95.0,
  })
  deliveryRate: number;

  @ApiProperty({
    description: 'Open rate percentage (for emails)',
    example: 25.5,
  })
  openRate: number;

  @ApiProperty({
    description: 'Statistics by type',
    example: {
      EMAIL: { sent: 800, delivered: 760, failed: 40 },
      SMS: { sent: 200, delivered: 190, failed: 10 },
    },
  })
  byType: any;
}

