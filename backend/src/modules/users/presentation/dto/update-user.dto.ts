import { ApiProperty, PartialType, OmitType } from '@nestjs/swagger';
import { IsOptional, IsBoolean } from 'class-validator';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(
  OmitType(CreateUserDto, ['password'] as const)
) {
  @ApiProperty({
    description: 'Whether the user is suspended',
    example: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isSuspended?: boolean;
}

export class UpdateUserProfileDto extends PartialType(
  OmitType(CreateUserDto, ['password', 'roleIds', 'isActive'] as const)
) {}

export class AdminUpdateUserDto extends PartialType(CreateUserDto) {
  @ApiProperty({
    description: 'Whether the user is suspended',
    example: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isSuspended?: boolean;
}

