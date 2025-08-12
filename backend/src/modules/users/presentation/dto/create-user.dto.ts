import { ApiProperty } from '@nestjs/swagger';
import { 
  IsEmail, 
  IsString, 
  IsOptional, 
  MinLength, 
  MaxLength, 
  IsAlphanumeric,
  IsArray,
  IsUUID,
  Matches
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    description: 'Email address',
    example: 'user@example.com',
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @ApiProperty({
    description: 'Username (optional)',
    example: 'johndoe',
    required: false,
    minLength: 3,
    maxLength: 30,
  })
  @IsOptional()
  @IsString()
  @MinLength(3, { message: 'Username must be at least 3 characters long' })
  @MaxLength(30, { message: 'Username must not exceed 30 characters' })
  @IsAlphanumeric('en-US', { message: 'Username must contain only letters and numbers' })
  username?: string;

  @ApiProperty({
    description: 'First name',
    example: 'John',
    required: false,
    maxLength: 50,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50, { message: 'First name must not exceed 50 characters' })
  firstName?: string;

  @ApiProperty({
    description: 'Last name',
    example: 'Doe',
    required: false,
    maxLength: 50,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50, { message: 'Last name must not exceed 50 characters' })
  lastName?: string;

  @ApiProperty({
    description: 'Password (minimum 8 characters, must contain uppercase, lowercase, number and special character)',
    example: 'SecurePassword123!',
    minLength: 8,
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    {
      message: 'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character',
    },
  )
  password?: string;

  @ApiProperty({
    description: 'Phone number',
    example: '+1234567890',
    required: false,
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({
    description: 'Bio/description',
    example: 'Software developer with 5 years of experience',
    required: false,
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'Bio must not exceed 500 characters' })
  bio?: string;

  @ApiProperty({
    description: 'Role IDs to assign to the user',
    example: ['role-id-1', 'role-id-2'],
    required: false,
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true, message: 'Each role ID must be a valid UUID' })
  roleIds?: string[];

  @ApiProperty({
    description: 'Whether the user is active',
    example: true,
    required: false,
    default: true,
  })
  @IsOptional()
  isActive?: boolean;
}

