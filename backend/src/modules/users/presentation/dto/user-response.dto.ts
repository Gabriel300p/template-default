import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({
    description: 'User ID',
    example: 'clp1234567890abcdef',
  })
  id: string;

  @ApiProperty({
    description: 'Email address',
    example: 'user@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'Username',
    example: 'johndoe',
    nullable: true,
  })
  username?: string;

  @ApiProperty({
    description: 'First name',
    example: 'John',
    nullable: true,
  })
  firstName?: string;

  @ApiProperty({
    description: 'Last name',
    example: 'Doe',
    nullable: true,
  })
  lastName?: string;

  @ApiProperty({
    description: 'Avatar URL',
    example: 'https://example.com/avatar.jpg',
    nullable: true,
  })
  avatar?: string;

  @ApiProperty({
    description: 'Bio/description',
    example: 'Software developer with 5 years of experience',
    nullable: true,
  })
  bio?: string;

  @ApiProperty({
    description: 'Phone number',
    example: '+1234567890',
    nullable: true,
  })
  phone?: string;

  @ApiProperty({
    description: 'Whether email is verified',
    example: true,
  })
  emailVerified: boolean;

  @ApiProperty({
    description: 'Whether user is active',
    example: true,
  })
  isActive: boolean;

  @ApiProperty({
    description: 'Whether user is suspended',
    example: false,
  })
  isSuspended: boolean;

  @ApiProperty({
    description: 'User roles',
    example: ['user', 'moderator'],
    type: [String],
  })
  roles: string[];

  @ApiProperty({
    description: 'User permissions',
    example: ['users:read', 'profile:update'],
    type: [String],
  })
  permissions: string[];

  @ApiProperty({
    description: 'Account creation date',
    example: '2023-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update date',
    example: '2023-01-01T00:00:00.000Z',
  })
  updatedAt: Date;

  @ApiProperty({
    description: 'Last login date',
    example: '2023-01-01T00:00:00.000Z',
    nullable: true,
  })
  lastLogin?: Date;
}

export class UserListResponseDto {
  @ApiProperty({
    description: 'List of users',
    type: [UserResponseDto],
  })
  users: UserResponseDto[];

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

export class UserStatsResponseDto {
  @ApiProperty({
    description: 'Total number of users',
    example: 1000,
  })
  totalUsers: number;

  @ApiProperty({
    description: 'Number of active users',
    example: 950,
  })
  activeUsers: number;

  @ApiProperty({
    description: 'Number of suspended users',
    example: 50,
  })
  suspendedUsers: number;

  @ApiProperty({
    description: 'Number of users with verified email',
    example: 900,
  })
  verifiedUsers: number;

  @ApiProperty({
    description: 'Number of users registered today',
    example: 5,
  })
  newUsersToday: number;

  @ApiProperty({
    description: 'Number of users registered this week',
    example: 25,
  })
  newUsersThisWeek: number;

  @ApiProperty({
    description: 'Number of users registered this month',
    example: 100,
  })
  newUsersThisMonth: number;
}

