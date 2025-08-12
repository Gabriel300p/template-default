import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength, Matches } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({
    description: 'Current password',
    example: 'CurrentPassword123!',
  })
  @IsString()
  currentPassword: string;

  @ApiProperty({
    description: 'New password (minimum 8 characters, must contain uppercase, lowercase, number and special character)',
    example: 'NewSecurePassword123!',
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
  newPassword: string;

  @ApiProperty({
    description: 'New password confirmation',
    example: 'NewSecurePassword123!',
  })
  @IsString()
  confirmNewPassword: string;
}

export class ForgotPasswordDto {
  @ApiProperty({
    description: 'Email address',
    example: 'user@example.com',
  })
  @IsString()
  email: string;
}

export class ResetPasswordDto {
  @ApiProperty({
    description: 'Password reset token',
    example: 'reset-token-here',
  })
  @IsString()
  token: string;

  @ApiProperty({
    description: 'New password (minimum 8 characters, must contain uppercase, lowercase, number and special character)',
    example: 'NewSecurePassword123!',
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
  newPassword: string;

  @ApiProperty({
    description: 'New password confirmation',
    example: 'NewSecurePassword123!',
  })
  @IsString()
  confirmNewPassword: string;
}

