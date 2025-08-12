import { ApiProperty } from '@nestjs/swagger';
import { 
  IsEnum, 
  IsString, 
  IsOptional, 
  IsObject,
  IsBoolean,
  MaxLength,
  MinLength
} from 'class-validator';
import { CommunicationType } from '@prisma/client';

export class CreateTemplateDto {
  @ApiProperty({
    description: 'Template name/identifier',
    example: 'welcome-email',
    minLength: 1,
    maxLength: 100,
  })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name: string;

  @ApiProperty({
    description: 'Template description',
    example: 'Welcome email template for new users',
    required: false,
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiProperty({
    description: 'Type of communication this template is for',
    enum: CommunicationType,
    example: CommunicationType.EMAIL,
  })
  @IsEnum(CommunicationType)
  type: CommunicationType;

  @ApiProperty({
    description: 'Template subject (for emails)',
    example: 'Welcome to {{appName}}!',
    required: false,
    maxLength: 200,
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  subject?: string;

  @ApiProperty({
    description: 'Template content with variables',
    example: 'Hello {{name}}, welcome to {{appName}}! Your account has been created successfully.',
    minLength: 1,
    maxLength: 10000,
  })
  @IsString()
  @MinLength(1)
  @MaxLength(10000)
  content: string;

  @ApiProperty({
    description: 'Template variables schema',
    example: { name: 'string', appName: 'string', activationUrl: 'string' },
    required: false,
  })
  @IsOptional()
  @IsObject()
  variables?: any;

  @ApiProperty({
    description: 'Whether the template is active',
    example: true,
    required: false,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true;
}

export class UpdateTemplateDto {
  @ApiProperty({
    description: 'Template description',
    example: 'Updated welcome email template for new users',
    required: false,
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiProperty({
    description: 'Template subject (for emails)',
    example: 'Welcome to {{appName}}!',
    required: false,
    maxLength: 200,
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  subject?: string;

  @ApiProperty({
    description: 'Template content with variables',
    example: 'Hello {{name}}, welcome to {{appName}}! Your account has been created successfully.',
    required: false,
    minLength: 1,
    maxLength: 10000,
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(10000)
  content?: string;

  @ApiProperty({
    description: 'Template variables schema',
    example: { name: 'string', appName: 'string', activationUrl: 'string' },
    required: false,
  })
  @IsOptional()
  @IsObject()
  variables?: any;

  @ApiProperty({
    description: 'Whether the template is active',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class SendTemplateDto {
  @ApiProperty({
    description: 'Template name/identifier',
    example: 'welcome-email',
  })
  @IsString()
  templateName: string;

  @ApiProperty({
    description: 'Target user ID (optional if email/phone provided)',
    example: 'clp1234567890abcdef',
    required: false,
  })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiProperty({
    description: 'Target email address (required for EMAIL type if no userId)',
    example: 'user@example.com',
    required: false,
  })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiProperty({
    description: 'Target phone number (required for SMS type if no userId)',
    example: '+1234567890',
    required: false,
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({
    description: 'Variables to replace in template',
    example: { name: 'John Doe', appName: 'MyApp', activationUrl: 'https://app.example.com/activate/123' },
  })
  @IsObject()
  variables: any;

  @ApiProperty({
    description: 'Additional metadata',
    example: { source: 'registration', campaign: 'welcome-series' },
    required: false,
  })
  @IsOptional()
  @IsObject()
  metadata?: any;
}

