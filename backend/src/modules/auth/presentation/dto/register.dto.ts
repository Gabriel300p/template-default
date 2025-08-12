import { ApiProperty } from '@nestjs/swagger';
import { 
  IsEmail, 
  IsString, 
  MinLength, 
  MaxLength, 
  Matches, 
  IsOptional,
  IsAlphanumeric 
} from 'class-validator';

export class RegisterDto {
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
  })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    {
      message: 'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character',
    },
  )
  password: string;

  @ApiProperty({
    description: 'Password confirmation',
    example: 'SecurePassword123!',
  })
  @IsString()
  confirmPassword: string;
}

export class RegisterResponseDto {
  @ApiProperty({
    description: 'Success message',
    example: 'User registered successfully',
  })
  message: string;

  @ApiProperty({
    description: 'User information',
  })
  user: {
    id: string;
    email: string;
    username?: string;
    firstName?: string;
    lastName?: string;
    emailVerified: boolean;
  };

  @ApiProperty({
    description: 'Whether email verification is required',
    example: false,
  })
  emailVerificationRequired: boolean;
}

