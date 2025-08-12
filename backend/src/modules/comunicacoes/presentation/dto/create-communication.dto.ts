import { ApiProperty } from '@nestjs/swagger';
import { 
  IsEnum, 
  IsString, 
  IsOptional, 
  IsUUID, 
  IsEmail, 
  IsPhoneNumber,
  IsObject,
  IsDateString,
  MaxLength,
  MinLength
} from 'class-validator';
import { CommunicationType, CommunicationPriority } from '@prisma/client';

export class CreateCommunicationDto {
  @ApiProperty({
    description: 'Type of communication',
    enum: CommunicationType,
    example: CommunicationType.EMAIL,
  })
  @IsEnum(CommunicationType)
  type: CommunicationType;

  @ApiProperty({
    description: 'Priority level',
    enum: CommunicationPriority,
    example: CommunicationPriority.NORMAL,
    required: false,
    default: CommunicationPriority.NORMAL,
  })
  @IsOptional()
  @IsEnum(CommunicationPriority)
  priority?: CommunicationPriority = CommunicationPriority.NORMAL;

  @ApiProperty({
    description: 'Target user ID (optional if email/phone provided)',
    example: 'clp1234567890abcdef',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  userId?: string;

  @ApiProperty({
    description: 'Target email address (required for EMAIL type if no userId)',
    example: 'user@example.com',
    required: false,
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({
    description: 'Target phone number (required for SMS type if no userId)',
    example: '+1234567890',
    required: false,
  })
  @IsOptional()
  @IsPhoneNumber()
  phone?: string;

  @ApiProperty({
    description: 'Subject line (for emails)',
    example: 'Welcome to our platform!',
    required: false,
    maxLength: 200,
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  subject?: string;

  @ApiProperty({
    description: 'Message content',
    example: 'Welcome to our platform! We are excited to have you on board.',
    minLength: 1,
    maxLength: 10000,
  })
  @IsString()
  @MinLength(1)
  @MaxLength(10000)
  content: string;

  @ApiProperty({
    description: 'Additional metadata (JSON object)',
    example: { templateId: 'welcome', variables: { name: 'John' } },
    required: false,
  })
  @IsOptional()
  @IsObject()
  metadata?: any;

  @ApiProperty({
    description: 'Schedule delivery for later (ISO 8601 format)',
    example: '2023-12-31T23:59:59.000Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  scheduledAt?: string;

  @ApiProperty({
    description: 'Maximum number of retry attempts',
    example: 3,
    required: false,
    default: 3,
  })
  @IsOptional()
  maxRetries?: number = 3;
}

