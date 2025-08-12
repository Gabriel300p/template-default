import { 
  Injectable, 
  NotFoundException, 
  BadRequestException,
  Logger 
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@/shared/database/prisma.service';
import { CreateCommunicationDto } from '../../presentation/dto/create-communication.dto';
import { CommunicationResponseDto, CommunicationListResponseDto, CommunicationStatsResponseDto } from '../../presentation/dto/communication-response.dto';
import { EmailService } from './email.service';
import { CommunicationType, CommunicationStatus, CommunicationPriority, Prisma } from '@prisma/client';

@Injectable()
export class CommunicationService {
  private readonly logger = new Logger(CommunicationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
  ) {}

  async create(createCommunicationDto: CreateCommunicationDto): Promise<CommunicationResponseDto> {
    try {
      // Validate target recipient
      if (!createCommunicationDto.userId && !createCommunicationDto.email && !createCommunicationDto.phone) {
        throw new BadRequestException('Either userId, email, or phone must be provided');
      }

      // Validate type-specific requirements
      if (createCommunicationDto.type === CommunicationType.EMAIL) {
        if (!createCommunicationDto.userId && !createCommunicationDto.email) {
          throw new BadRequestException('Email address is required for EMAIL type');
        }
      }

      if (createCommunicationDto.type === CommunicationType.SMS) {
        if (!createCommunicationDto.userId && !createCommunicationDto.phone) {
          throw new BadRequestException('Phone number is required for SMS type');
        }
      }

      // Get user details if userId provided
      let targetEmail = createCommunicationDto.email;
      let targetPhone = createCommunicationDto.phone;

      if (createCommunicationDto.userId) {
        const user = await this.prisma.user.findUnique({
          where: { id: createCommunicationDto.userId },
          select: { email: true, phone: true },
        });

        if (!user) {
          throw new NotFoundException('User not found');
        }

        targetEmail = targetEmail || user.email;
        targetPhone = targetPhone || user.phone;
      }

      // Create communication record
      const communication = await this.prisma.communication.create({
        data: {
          type: createCommunicationDto.type,
          priority: createCommunicationDto.priority,
          userId: createCommunicationDto.userId,
          email: targetEmail,
          phone: targetPhone,
          subject: createCommunicationDto.subject,
          content: createCommunicationDto.content,
          metadata: createCommunicationDto.metadata,
          scheduledAt: createCommunicationDto.scheduledAt ? new Date(createCommunicationDto.scheduledAt) : null,
          maxRetries: createCommunicationDto.maxRetries,
          status: createCommunicationDto.scheduledAt ? CommunicationStatus.SCHEDULED : CommunicationStatus.PENDING,
        },
      });

      // Send immediately if not scheduled
      if (!createCommunicationDto.scheduledAt) {
        await this.sendCommunication(communication.id);
      }

      this.logger.log(`Communication created: ${communication.id}`);
      return this.transformToResponseDto(communication);
    } catch (error) {
      this.logger.error('Error creating communication', error);
      throw error;
    }
  }

  async findAll(params: {
    page?: number;
    limit?: number;
    type?: CommunicationType;
    status?: CommunicationStatus;
    userId?: string;
  }): Promise<CommunicationListResponseDto> {
    try {
      const { page = 1, limit = 20, type, status, userId } = params;
      const skip = (page - 1) * limit;

      const where: Prisma.CommunicationWhereInput = {
        ...(type && { type }),
        ...(status && { status }),
        ...(userId && { userId }),
      };

      const [communications, total] = await Promise.all([
        this.prisma.communication.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
        this.prisma.communication.count({ where }),
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        communications: communications.map(comm => this.transformToResponseDto(comm)),
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
      this.logger.error('Error finding communications', error);
      throw error;
    }
  }

  async findOne(id: string): Promise<CommunicationResponseDto> {
    try {
      const communication = await this.prisma.communication.findUnique({
        where: { id },
      });

      if (!communication) {
        throw new NotFoundException('Communication not found');
      }

      return this.transformToResponseDto(communication);
    } catch (error) {
      this.logger.error(`Error finding communication ${id}`, error);
      throw error;
    }
  }

  async retry(id: string): Promise<CommunicationResponseDto> {
    try {
      const communication = await this.prisma.communication.findUnique({
        where: { id },
      });

      if (!communication) {
        throw new NotFoundException('Communication not found');
      }

      if (communication.status === CommunicationStatus.SENT || communication.status === CommunicationStatus.DELIVERED) {
        throw new BadRequestException('Communication already sent successfully');
      }

      if (communication.retryCount >= communication.maxRetries) {
        throw new BadRequestException('Maximum retry attempts reached');
      }

      await this.sendCommunication(id);
      return await this.findOne(id);
    } catch (error) {
      this.logger.error(`Error retrying communication ${id}`, error);
      throw error;
    }
  }

  async cancel(id: string): Promise<CommunicationResponseDto> {
    try {
      const communication = await this.prisma.communication.update({
        where: { id },
        data: { 
          status: CommunicationStatus.CANCELLED,
          updatedAt: new Date(),
        },
      });

      this.logger.log(`Communication cancelled: ${id}`);
      return this.transformToResponseDto(communication);
    } catch (error) {
      this.logger.error(`Error cancelling communication ${id}`, error);
      throw error;
    }
  }

  async getStats(params?: {
    startDate?: Date;
    endDate?: Date;
    type?: CommunicationType;
  }): Promise<CommunicationStatsResponseDto> {
    try {
      const { startDate, endDate, type } = params || {};

      const where: Prisma.CommunicationWhereInput = {
        ...(type && { type }),
        ...(startDate && endDate && {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        }),
      };

      const [
        totalSent,
        delivered,
        failed,
        pending,
        scheduled,
        byTypeStats,
        openedEmails,
      ] = await Promise.all([
        this.prisma.communication.count({
          where: {
            ...where,
            status: {
              in: [CommunicationStatus.SENT, CommunicationStatus.DELIVERED],
            },
          },
        }),
        this.prisma.communication.count({
          where: {
            ...where,
            status: CommunicationStatus.DELIVERED,
          },
        }),
        this.prisma.communication.count({
          where: {
            ...where,
            status: CommunicationStatus.FAILED,
          },
        }),
        this.prisma.communication.count({
          where: {
            ...where,
            status: CommunicationStatus.PENDING,
          },
        }),
        this.prisma.communication.count({
          where: {
            ...where,
            status: CommunicationStatus.SCHEDULED,
          },
        }),
        this.prisma.communication.groupBy({
          by: ['type', 'status'],
          where,
          _count: true,
        }),
        this.prisma.communication.count({
          where: {
            ...where,
            type: CommunicationType.EMAIL,
            readAt: { not: null },
          },
        }),
      ]);

      const deliveryRate = totalSent > 0 ? (delivered / totalSent) * 100 : 0;
      const openRate = totalSent > 0 ? (openedEmails / totalSent) * 100 : 0;

      // Process by type stats
      const byType = {};
      for (const stat of byTypeStats) {
        if (!byType[stat.type]) {
          byType[stat.type] = { sent: 0, delivered: 0, failed: 0 };
        }
        
        if (stat.status === CommunicationStatus.SENT || stat.status === CommunicationStatus.DELIVERED) {
          byType[stat.type].sent += stat._count;
        }
        if (stat.status === CommunicationStatus.DELIVERED) {
          byType[stat.type].delivered += stat._count;
        }
        if (stat.status === CommunicationStatus.FAILED) {
          byType[stat.type].failed += stat._count;
        }
      }

      return {
        totalSent,
        delivered,
        failed,
        pending,
        scheduled,
        deliveryRate: Math.round(deliveryRate * 100) / 100,
        openRate: Math.round(openRate * 100) / 100,
        byType,
      };
    } catch (error) {
      this.logger.error('Error getting communication stats', error);
      throw error;
    }
  }

  async markAsRead(id: string): Promise<CommunicationResponseDto> {
    try {
      const communication = await this.prisma.communication.update({
        where: { id },
        data: { 
          readAt: new Date(),
          updatedAt: new Date(),
        },
      });

      return this.transformToResponseDto(communication);
    } catch (error) {
      this.logger.error(`Error marking communication as read ${id}`, error);
      throw error;
    }
  }

  async processScheduled(): Promise<number> {
    try {
      const now = new Date();
      const scheduledCommunications = await this.prisma.communication.findMany({
        where: {
          status: CommunicationStatus.SCHEDULED,
          scheduledAt: {
            lte: now,
          },
        },
        take: 100, // Process in batches
      });

      let processed = 0;
      for (const communication of scheduledCommunications) {
        try {
          await this.sendCommunication(communication.id);
          processed++;
        } catch (error) {
          this.logger.error(`Error processing scheduled communication ${communication.id}`, error);
        }
      }

      this.logger.log(`Processed ${processed} scheduled communications`);
      return processed;
    } catch (error) {
      this.logger.error('Error processing scheduled communications', error);
      throw error;
    }
  }

  private async sendCommunication(id: string): Promise<void> {
    try {
      const communication = await this.prisma.communication.findUnique({
        where: { id },
      });

      if (!communication) {
        throw new NotFoundException('Communication not found');
      }

      // Update status to sending
      await this.prisma.communication.update({
        where: { id },
        data: { 
          status: CommunicationStatus.SENDING,
          retryCount: communication.retryCount + 1,
          updatedAt: new Date(),
        },
      });

      let success = false;
      let errorMessage: string | null = null;

      try {
        switch (communication.type) {
          case CommunicationType.EMAIL:
            await this.emailService.sendEmail({
              to: communication.email!,
              subject: communication.subject || 'No Subject',
              content: communication.content,
              metadata: communication.metadata,
            });
            success = true;
            break;

          case CommunicationType.SMS:
            // SMS implementation would go here
            // await this.smsService.sendSms(...)
            success = true;
            break;

          case CommunicationType.PUSH:
            // Push notification implementation would go here
            // await this.pushService.sendPush(...)
            success = true;
            break;

          default:
            throw new Error(`Unsupported communication type: ${communication.type}`);
        }
      } catch (error) {
        success = false;
        errorMessage = error.message;
        this.logger.error(`Error sending communication ${id}`, error);
      }

      // Update final status
      await this.prisma.communication.update({
        where: { id },
        data: {
          status: success ? CommunicationStatus.SENT : CommunicationStatus.FAILED,
          sentAt: success ? new Date() : null,
          errorMessage,
          updatedAt: new Date(),
        },
      });

      if (success) {
        this.logger.log(`Communication sent successfully: ${id}`);
      }
    } catch (error) {
      this.logger.error(`Error in sendCommunication for ${id}`, error);
      throw error;
    }
  }

  private transformToResponseDto(communication: any): CommunicationResponseDto {
    return {
      id: communication.id,
      type: communication.type,
      status: communication.status,
      priority: communication.priority,
      userId: communication.userId,
      email: communication.email,
      phone: communication.phone,
      subject: communication.subject,
      content: communication.content,
      retryCount: communication.retryCount,
      maxRetries: communication.maxRetries,
      errorMessage: communication.errorMessage,
      sentAt: communication.sentAt,
      deliveredAt: communication.deliveredAt,
      readAt: communication.readAt,
      scheduledAt: communication.scheduledAt,
      metadata: communication.metadata,
      createdAt: communication.createdAt,
      updatedAt: communication.updatedAt,
    };
  }
}

