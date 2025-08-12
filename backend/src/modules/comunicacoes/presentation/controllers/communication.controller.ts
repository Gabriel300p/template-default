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
import { CommunicationService } from '../../application/services/communication.service';
import { TemplateService } from '../../application/services/template.service';

// DTOs
import { CreateCommunicationDto } from '../dto/create-communication.dto';
import { CommunicationResponseDto, CommunicationListResponseDto, CommunicationStatsResponseDto } from '../dto/communication-response.dto';
import { CreateTemplateDto, UpdateTemplateDto, SendTemplateDto } from '../dto/template.dto';

// Guards
import { JwtAuthGuard } from '@/modules/auth/presentation/guards/jwt-auth.guard';

// Decorators
import { CurrentUser } from '@/shared/common/decorators/current-user.decorator';
import { Permissions } from '@/shared/common/decorators/permissions.decorator';

// Types
import { CommunicationType, CommunicationStatus } from '@prisma/client';

@ApiTags('Communications')
@Controller('communications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class CommunicationController {
  private readonly logger = new Logger(CommunicationController.name);

  constructor(
    private readonly communicationService: CommunicationService,
    private readonly templateService: TemplateService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Permissions('communications:create')
  @Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 communications per minute
  @ApiOperation({ summary: 'Create a new communication' })
  @ApiResponse({
    status: 201,
    description: 'Communication created successfully',
    type: CommunicationResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid communication data',
  })
  @ApiResponse({
    status: 403,
    description: 'Insufficient permissions',
  })
  async create(
    @Body() createCommunicationDto: CreateCommunicationDto,
    @CurrentUser() currentUser: any,
  ): Promise<CommunicationResponseDto> {
    try {
      this.logger.log(`Creating communication by user ${currentUser.id}`);
      return await this.communicationService.create(createCommunicationDto);
    } catch (error) {
      this.logger.error('Error creating communication', error);
      throw error;
    }
  }

  @Get()
  @Permissions('communications:list')
  @ApiOperation({ summary: 'Get all communications with pagination and filtering' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  @ApiQuery({ name: 'type', required: false, enum: CommunicationType, description: 'Communication type' })
  @ApiQuery({ name: 'status', required: false, enum: CommunicationStatus, description: 'Communication status' })
  @ApiQuery({ name: 'userId', required: false, type: String, description: 'Filter by user ID' })
  @ApiResponse({
    status: 200,
    description: 'Communications retrieved successfully',
    type: CommunicationListResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Insufficient permissions',
  })
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('type') type?: CommunicationType,
    @Query('status') status?: CommunicationStatus,
    @Query('userId') userId?: string,
  ): Promise<CommunicationListResponseDto> {
    try {
      return await this.communicationService.findAll({
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
        type,
        status,
        userId,
      });
    } catch (error) {
      this.logger.error('Error retrieving communications', error);
      throw error;
    }
  }

  @Get('stats')
  @Permissions('communications:list')
  @ApiOperation({ summary: 'Get communication statistics' })
  @ApiQuery({ name: 'startDate', required: false, type: String, description: 'Start date (ISO format)' })
  @ApiQuery({ name: 'endDate', required: false, type: String, description: 'End date (ISO format)' })
  @ApiQuery({ name: 'type', required: false, enum: CommunicationType, description: 'Communication type' })
  @ApiResponse({
    status: 200,
    description: 'Communication statistics retrieved successfully',
    type: CommunicationStatsResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Insufficient permissions',
  })
  async getStats(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('type') type?: CommunicationType,
  ): Promise<CommunicationStatsResponseDto> {
    try {
      return await this.communicationService.getStats({
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        type,
      });
    } catch (error) {
      this.logger.error('Error retrieving communication stats', error);
      throw error;
    }
  }

  @Get(':id')
  @Permissions('communications:read')
  @ApiOperation({ summary: 'Get communication by ID' })
  @ApiParam({
    name: 'id',
    description: 'Communication ID',
    example: 'clp1234567890abcdef',
  })
  @ApiResponse({
    status: 200,
    description: 'Communication retrieved successfully',
    type: CommunicationResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Communication not found',
  })
  @ApiResponse({
    status: 403,
    description: 'Insufficient permissions',
  })
  async findOne(@Param('id') id: string): Promise<CommunicationResponseDto> {
    try {
      return await this.communicationService.findOne(id);
    } catch (error) {
      this.logger.error(`Error retrieving communication ${id}`, error);
      throw error;
    }
  }

  @Post(':id/retry')
  @Permissions('communications:update')
  @ApiOperation({ summary: 'Retry failed communication' })
  @ApiParam({
    name: 'id',
    description: 'Communication ID',
    example: 'clp1234567890abcdef',
  })
  @ApiResponse({
    status: 200,
    description: 'Communication retry initiated',
    type: CommunicationResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Communication not found',
  })
  @ApiResponse({
    status: 400,
    description: 'Communication cannot be retried',
  })
  @ApiResponse({
    status: 403,
    description: 'Insufficient permissions',
  })
  async retry(
    @Param('id') id: string,
    @CurrentUser() currentUser: any,
  ): Promise<CommunicationResponseDto> {
    try {
      this.logger.log(`Retrying communication ${id} by user ${currentUser.id}`);
      return await this.communicationService.retry(id);
    } catch (error) {
      this.logger.error(`Error retrying communication ${id}`, error);
      throw error;
    }
  }

  @Patch(':id/cancel')
  @Permissions('communications:update')
  @ApiOperation({ summary: 'Cancel scheduled communication' })
  @ApiParam({
    name: 'id',
    description: 'Communication ID',
    example: 'clp1234567890abcdef',
  })
  @ApiResponse({
    status: 200,
    description: 'Communication cancelled successfully',
    type: CommunicationResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Communication not found',
  })
  @ApiResponse({
    status: 403,
    description: 'Insufficient permissions',
  })
  async cancel(
    @Param('id') id: string,
    @CurrentUser() currentUser: any,
  ): Promise<CommunicationResponseDto> {
    try {
      this.logger.log(`Cancelling communication ${id} by user ${currentUser.id}`);
      return await this.communicationService.cancel(id);
    } catch (error) {
      this.logger.error(`Error cancelling communication ${id}`, error);
      throw error;
    }
  }

  @Patch(':id/read')
  @Permissions('communications:update')
  @ApiOperation({ summary: 'Mark communication as read' })
  @ApiParam({
    name: 'id',
    description: 'Communication ID',
    example: 'clp1234567890abcdef',
  })
  @ApiResponse({
    status: 200,
    description: 'Communication marked as read',
    type: CommunicationResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Communication not found',
  })
  async markAsRead(@Param('id') id: string): Promise<CommunicationResponseDto> {
    try {
      return await this.communicationService.markAsRead(id);
    } catch (error) {
      this.logger.error(`Error marking communication as read ${id}`, error);
      throw error;
    }
  }

  // Template endpoints
  @Post('templates')
  @Permissions('communications:create')
  @ApiOperation({ summary: 'Create a new communication template' })
  @ApiResponse({
    status: 201,
    description: 'Template created successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid template data',
  })
  @ApiResponse({
    status: 409,
    description: 'Template name already exists',
  })
  @ApiResponse({
    status: 403,
    description: 'Insufficient permissions',
  })
  async createTemplate(
    @Body() createTemplateDto: CreateTemplateDto,
    @CurrentUser() currentUser: any,
  ): Promise<any> {
    try {
      this.logger.log(`Creating template ${createTemplateDto.name} by user ${currentUser.id}`);
      return await this.templateService.create(createTemplateDto);
    } catch (error) {
      this.logger.error('Error creating template', error);
      throw error;
    }
  }

  @Get('templates')
  @Permissions('communications:list')
  @ApiOperation({ summary: 'Get all communication templates' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  @ApiQuery({ name: 'type', required: false, enum: CommunicationType, description: 'Template type' })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean, description: 'Filter by active status' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search in name and description' })
  @ApiResponse({
    status: 200,
    description: 'Templates retrieved successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Insufficient permissions',
  })
  async findAllTemplates(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('type') type?: CommunicationType,
    @Query('isActive') isActive?: boolean,
    @Query('search') search?: string,
  ): Promise<any> {
    try {
      return await this.templateService.findAll({
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
        type,
        isActive,
        search,
      });
    } catch (error) {
      this.logger.error('Error retrieving templates', error);
      throw error;
    }
  }

  @Post('templates/send')
  @Permissions('communications:create')
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 template sends per minute
  @ApiOperation({ summary: 'Send communication using template' })
  @ApiResponse({
    status: 200,
    description: 'Template sent successfully',
    type: CommunicationResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid template data or missing variables',
  })
  @ApiResponse({
    status: 404,
    description: 'Template not found',
  })
  @ApiResponse({
    status: 403,
    description: 'Insufficient permissions',
  })
  async sendTemplate(
    @Body() sendTemplateDto: SendTemplateDto,
    @CurrentUser() currentUser: any,
  ): Promise<CommunicationResponseDto> {
    try {
      this.logger.log(`Sending template ${sendTemplateDto.templateName} by user ${currentUser.id}`);
      return await this.templateService.sendTemplate(sendTemplateDto);
    } catch (error) {
      this.logger.error('Error sending template', error);
      throw error;
    }
  }

  @Get('templates/:id')
  @Permissions('communications:read')
  @ApiOperation({ summary: 'Get template by ID' })
  @ApiParam({
    name: 'id',
    description: 'Template ID',
    example: 'clp1234567890abcdef',
  })
  @ApiResponse({
    status: 200,
    description: 'Template retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Template not found',
  })
  @ApiResponse({
    status: 403,
    description: 'Insufficient permissions',
  })
  async findOneTemplate(@Param('id') id: string): Promise<any> {
    try {
      return await this.templateService.findOne(id);
    } catch (error) {
      this.logger.error(`Error retrieving template ${id}`, error);
      throw error;
    }
  }

  @Patch('templates/:id')
  @Permissions('communications:update')
  @ApiOperation({ summary: 'Update template' })
  @ApiParam({
    name: 'id',
    description: 'Template ID',
    example: 'clp1234567890abcdef',
  })
  @ApiResponse({
    status: 200,
    description: 'Template updated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Template not found',
  })
  @ApiResponse({
    status: 403,
    description: 'Insufficient permissions',
  })
  async updateTemplate(
    @Param('id') id: string,
    @Body() updateTemplateDto: UpdateTemplateDto,
    @CurrentUser() currentUser: any,
  ): Promise<any> {
    try {
      this.logger.log(`Updating template ${id} by user ${currentUser.id}`);
      return await this.templateService.update(id, updateTemplateDto);
    } catch (error) {
      this.logger.error(`Error updating template ${id}`, error);
      throw error;
    }
  }

  @Delete('templates/:id')
  @Permissions('communications:delete')
  @ApiOperation({ summary: 'Delete template' })
  @ApiParam({
    name: 'id',
    description: 'Template ID',
    example: 'clp1234567890abcdef',
  })
  @ApiResponse({
    status: 200,
    description: 'Template deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Template not found',
  })
  @ApiResponse({
    status: 403,
    description: 'Insufficient permissions',
  })
  async deleteTemplate(
    @Param('id') id: string,
    @CurrentUser() currentUser: any,
  ): Promise<{ message: string }> {
    try {
      this.logger.log(`Deleting template ${id} by user ${currentUser.id}`);
      await this.templateService.delete(id);
      return { message: 'Template deleted successfully' };
    } catch (error) {
      this.logger.error(`Error deleting template ${id}`, error);
      throw error;
    }
  }
}

