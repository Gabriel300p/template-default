import { 
  Injectable, 
  NotFoundException, 
  ConflictException,
  BadRequestException,
  Logger 
} from '@nestjs/common';
import { PrismaService } from '@/shared/database/prisma.service';
import { CreateTemplateDto, UpdateTemplateDto, SendTemplateDto } from '../../presentation/dto/template.dto';
import { CommunicationType, Prisma } from '@prisma/client';
import { CommunicationService } from './communication.service';

export interface TemplateResponseDto {
  id: string;
  name: string;
  description?: string;
  type: CommunicationType;
  subject?: string;
  content: string;
  variables?: any;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class TemplateService {
  private readonly logger = new Logger(TemplateService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly communicationService: CommunicationService,
  ) {}

  async create(createTemplateDto: CreateTemplateDto): Promise<TemplateResponseDto> {
    try {
      // Check if template name already exists
      const existingTemplate = await this.prisma.communicationTemplate.findUnique({
        where: { name: createTemplateDto.name },
      });

      if (existingTemplate) {
        throw new ConflictException('Template name already exists');
      }

      const template = await this.prisma.communicationTemplate.create({
        data: {
          name: createTemplateDto.name,
          description: createTemplateDto.description,
          type: createTemplateDto.type,
          subject: createTemplateDto.subject,
          content: createTemplateDto.content,
          variables: createTemplateDto.variables,
          isActive: createTemplateDto.isActive,
        },
      });

      this.logger.log(`Template created: ${template.id} (${template.name})`);
      return this.transformToResponseDto(template);
    } catch (error) {
      this.logger.error('Error creating template', error);
      throw error;
    }
  }

  async findAll(params?: {
    page?: number;
    limit?: number;
    type?: CommunicationType;
    isActive?: boolean;
    search?: string;
  }): Promise<{
    templates: TemplateResponseDto[];
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
      const { page = 1, limit = 20, type, isActive, search } = params || {};
      const skip = (page - 1) * limit;

      const where: Prisma.CommunicationTemplateWhereInput = {
        ...(type && { type }),
        ...(isActive !== undefined && { isActive }),
        ...(search && {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
          ],
        }),
      };

      const [templates, total] = await Promise.all([
        this.prisma.communicationTemplate.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
        this.prisma.communicationTemplate.count({ where }),
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        templates: templates.map(template => this.transformToResponseDto(template)),
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
      this.logger.error('Error finding templates', error);
      throw error;
    }
  }

  async findOne(id: string): Promise<TemplateResponseDto> {
    try {
      const template = await this.prisma.communicationTemplate.findUnique({
        where: { id },
      });

      if (!template) {
        throw new NotFoundException('Template not found');
      }

      return this.transformToResponseDto(template);
    } catch (error) {
      this.logger.error(`Error finding template ${id}`, error);
      throw error;
    }
  }

  async findByName(name: string): Promise<TemplateResponseDto> {
    try {
      const template = await this.prisma.communicationTemplate.findUnique({
        where: { name },
      });

      if (!template) {
        throw new NotFoundException('Template not found');
      }

      if (!template.isActive) {
        throw new BadRequestException('Template is not active');
      }

      return this.transformToResponseDto(template);
    } catch (error) {
      this.logger.error(`Error finding template by name ${name}`, error);
      throw error;
    }
  }

  async update(id: string, updateTemplateDto: UpdateTemplateDto): Promise<TemplateResponseDto> {
    try {
      const existingTemplate = await this.prisma.communicationTemplate.findUnique({
        where: { id },
      });

      if (!existingTemplate) {
        throw new NotFoundException('Template not found');
      }

      const template = await this.prisma.communicationTemplate.update({
        where: { id },
        data: {
          ...updateTemplateDto,
          updatedAt: new Date(),
        },
      });

      this.logger.log(`Template updated: ${id}`);
      return this.transformToResponseDto(template);
    } catch (error) {
      this.logger.error(`Error updating template ${id}`, error);
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const template = await this.prisma.communicationTemplate.findUnique({
        where: { id },
      });

      if (!template) {
        throw new NotFoundException('Template not found');
      }

      await this.prisma.communicationTemplate.delete({
        where: { id },
      });

      this.logger.log(`Template deleted: ${id}`);
    } catch (error) {
      this.logger.error(`Error deleting template ${id}`, error);
      throw error;
    }
  }

  async activate(id: string): Promise<TemplateResponseDto> {
    try {
      const template = await this.prisma.communicationTemplate.update({
        where: { id },
        data: { 
          isActive: true,
          updatedAt: new Date(),
        },
      });

      this.logger.log(`Template activated: ${id}`);
      return this.transformToResponseDto(template);
    } catch (error) {
      this.logger.error(`Error activating template ${id}`, error);
      throw error;
    }
  }

  async deactivate(id: string): Promise<TemplateResponseDto> {
    try {
      const template = await this.prisma.communicationTemplate.update({
        where: { id },
        data: { 
          isActive: false,
          updatedAt: new Date(),
        },
      });

      this.logger.log(`Template deactivated: ${id}`);
      return this.transformToResponseDto(template);
    } catch (error) {
      this.logger.error(`Error deactivating template ${id}`, error);
      throw error;
    }
  }

  async sendTemplate(sendTemplateDto: SendTemplateDto): Promise<any> {
    try {
      // Get template
      const template = await this.findByName(sendTemplateDto.templateName);

      // Validate variables
      if (template.variables) {
        const requiredVars = Object.keys(template.variables);
        const providedVars = Object.keys(sendTemplateDto.variables || {});
        const missingVars = requiredVars.filter(v => !providedVars.includes(v));

        if (missingVars.length > 0) {
          throw new BadRequestException(`Missing required variables: ${missingVars.join(', ')}`);
        }
      }

      // Process template content
      const processedSubject = this.processTemplate(template.subject || '', sendTemplateDto.variables);
      const processedContent = this.processTemplate(template.content, sendTemplateDto.variables);

      // Send communication
      const communication = await this.communicationService.create({
        type: template.type,
        userId: sendTemplateDto.userId,
        email: sendTemplateDto.email,
        phone: sendTemplateDto.phone,
        subject: processedSubject,
        content: processedContent,
        metadata: {
          templateId: template.id,
          templateName: template.name,
          variables: sendTemplateDto.variables,
          ...sendTemplateDto.metadata,
        },
      });

      this.logger.log(`Template sent: ${template.name} (${communication.id})`);
      return communication;
    } catch (error) {
      this.logger.error(`Error sending template ${sendTemplateDto.templateName}`, error);
      throw error;
    }
  }

  async previewTemplate(templateName: string, variables: any): Promise<{
    subject?: string;
    content: string;
  }> {
    try {
      const template = await this.findByName(templateName);

      const processedSubject = this.processTemplate(template.subject || '', variables);
      const processedContent = this.processTemplate(template.content, variables);

      return {
        subject: processedSubject,
        content: processedContent,
      };
    } catch (error) {
      this.logger.error(`Error previewing template ${templateName}`, error);
      throw error;
    }
  }

  async validateTemplate(content: string, variables?: any): Promise<{
    isValid: boolean;
    errors: string[];
    missingVariables: string[];
  }> {
    try {
      const errors: string[] = [];
      const missingVariables: string[] = [];

      // Extract variables from template
      const variableRegex = /\{\{(\w+)\}\}/g;
      const foundVariables: string[] = [];
      let match;

      while ((match = variableRegex.exec(content)) !== null) {
        foundVariables.push(match[1]);
      }

      // Check for missing variables
      if (variables) {
        const providedVars = Object.keys(variables);
        missingVariables.push(...foundVariables.filter(v => !providedVars.includes(v)));
      }

      // Basic validation
      if (!content.trim()) {
        errors.push('Template content cannot be empty');
      }

      if (content.length > 10000) {
        errors.push('Template content exceeds maximum length (10000 characters)');
      }

      return {
        isValid: errors.length === 0,
        errors,
        missingVariables,
      };
    } catch (error) {
      this.logger.error('Error validating template', error);
      throw error;
    }
  }

  async getTemplateStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
    byType: Record<CommunicationType, number>;
    mostUsed: Array<{ name: string; usageCount: number }>;
  }> {
    try {
      const [
        total,
        active,
        inactive,
        byTypeStats,
        usageStats,
      ] = await Promise.all([
        this.prisma.communicationTemplate.count(),
        this.prisma.communicationTemplate.count({ where: { isActive: true } }),
        this.prisma.communicationTemplate.count({ where: { isActive: false } }),
        this.prisma.communicationTemplate.groupBy({
          by: ['type'],
          _count: true,
        }),
        this.prisma.communication.groupBy({
          by: ['metadata'],
          _count: true,
          take: 10,
          orderBy: { _count: { metadata: 'desc' } },
        }),
      ]);

      const byType = {} as Record<CommunicationType, number>;
      for (const stat of byTypeStats) {
        byType[stat.type] = stat._count;
      }

      // Process usage stats (simplified - in real implementation you'd track template usage properly)
      const mostUsed = usageStats
        .filter(stat => stat.metadata && typeof stat.metadata === 'object' && stat.metadata.templateName)
        .map(stat => ({
          name: stat.metadata.templateName,
          usageCount: stat._count,
        }))
        .slice(0, 5);

      return {
        total,
        active,
        inactive,
        byType,
        mostUsed,
      };
    } catch (error) {
      this.logger.error('Error getting template stats', error);
      throw error;
    }
  }

  private processTemplate(template: string, variables: any): string {
    if (!template || !variables) {
      return template;
    }

    let processed = template;
    
    // Replace variables in format {{variableName}}
    Object.keys(variables).forEach(key => {
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
      processed = processed.replace(regex, variables[key] || '');
    });

    return processed;
  }

  private transformToResponseDto(template: any): TemplateResponseDto {
    return {
      id: template.id,
      name: template.name,
      description: template.description,
      type: template.type,
      subject: template.subject,
      content: template.content,
      variables: template.variables,
      isActive: template.isActive,
      createdAt: template.createdAt,
      updatedAt: template.updatedAt,
    };
  }
}

