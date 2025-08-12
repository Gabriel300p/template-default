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
import { UsersService } from '../../application/services/users.service';
import { UserRoleService } from '../../application/services/user-role.service';

// DTOs
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto, AdminUpdateUserDto } from '../dto/update-user.dto';
import { UserQueryDto } from '../dto/user-query.dto';
import { UserResponseDto, UserListResponseDto, UserStatsResponseDto } from '../dto/user-response.dto';

// Guards
import { JwtAuthGuard } from '@/modules/auth/presentation/guards/jwt-auth.guard';

// Decorators
import { CurrentUser } from '@/shared/common/decorators/current-user.decorator';
import { Permissions } from '@/shared/common/decorators/permissions.decorator';
import { Roles } from '@/shared/common/decorators/roles.decorator';

// Types
import { Role } from '@prisma/client';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class UsersController {
  private readonly logger = new Logger(UsersController.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly userRoleService: UserRoleService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Permissions('users:create')
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 attempts per minute
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({
    status: 201,
    description: 'User created successfully',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid user data',
  })
  @ApiResponse({
    status: 409,
    description: 'User already exists',
  })
  @ApiResponse({
    status: 403,
    description: 'Insufficient permissions',
  })
  async create(@Body() createUserDto: CreateUserDto): Promise<UserResponseDto> {
    try {
      this.logger.log(`Creating user with email: ${createUserDto.email}`);
      return await this.usersService.create(createUserDto);
    } catch (error) {
      this.logger.error(`Error creating user with email: ${createUserDto.email}`, error);
      throw error;
    }
  }

  @Get()
  @Permissions('users:list')
  @ApiOperation({ summary: 'Get all users with pagination and filtering' })
  @ApiResponse({
    status: 200,
    description: 'Users retrieved successfully',
    type: UserListResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Insufficient permissions',
  })
  async findAll(@Query() query: UserQueryDto): Promise<UserListResponseDto> {
    try {
      return await this.usersService.findAll(query);
    } catch (error) {
      this.logger.error('Error retrieving users', error);
      throw error;
    }
  }

  @Get('stats')
  @Permissions('users:list')
  @ApiOperation({ summary: 'Get user statistics' })
  @ApiResponse({
    status: 200,
    description: 'User statistics retrieved successfully',
    type: UserStatsResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Insufficient permissions',
  })
  async getStats(): Promise<UserStatsResponseDto> {
    try {
      return await this.usersService.getStats();
    } catch (error) {
      this.logger.error('Error retrieving user stats', error);
      throw error;
    }
  }

  @Get(':id')
  @Permissions('users:read')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiParam({
    name: 'id',
    description: 'User ID',
    example: 'clp1234567890abcdef',
  })
  @ApiResponse({
    status: 200,
    description: 'User retrieved successfully',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  @ApiResponse({
    status: 403,
    description: 'Insufficient permissions',
  })
  async findOne(@Param('id') id: string): Promise<UserResponseDto> {
    try {
      return await this.usersService.findOne(id);
    } catch (error) {
      this.logger.error(`Error retrieving user ${id}`, error);
      throw error;
    }
  }

  @Patch(':id')
  @Permissions('users:update')
  @ApiOperation({ summary: 'Update user' })
  @ApiParam({
    name: 'id',
    description: 'User ID',
    example: 'clp1234567890abcdef',
  })
  @ApiResponse({
    status: 200,
    description: 'User updated successfully',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Email or username already exists',
  })
  @ApiResponse({
    status: 403,
    description: 'Insufficient permissions',
  })
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    try {
      this.logger.log(`Updating user ${id}`);
      return await this.usersService.update(id, updateUserDto);
    } catch (error) {
      this.logger.error(`Error updating user ${id}`, error);
      throw error;
    }
  }

  @Patch(':id/admin')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Admin update user (includes sensitive fields)' })
  @ApiParam({
    name: 'id',
    description: 'User ID',
    example: 'clp1234567890abcdef',
  })
  @ApiResponse({
    status: 200,
    description: 'User updated successfully',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  @ApiResponse({
    status: 403,
    description: 'Admin role required',
  })
  async adminUpdate(
    @Param('id') id: string,
    @Body() adminUpdateUserDto: AdminUpdateUserDto,
    @CurrentUser() currentUser: any,
  ): Promise<UserResponseDto> {
    try {
      this.logger.log(`Admin updating user ${id} by ${currentUser.id}`);
      return await this.usersService.adminUpdate(id, adminUpdateUserDto);
    } catch (error) {
      this.logger.error(`Error admin updating user ${id}`, error);
      throw error;
    }
  }

  @Delete(':id')
  @Permissions('users:delete')
  @ApiOperation({ summary: 'Delete user' })
  @ApiParam({
    name: 'id',
    description: 'User ID',
    example: 'clp1234567890abcdef',
  })
  @ApiResponse({
    status: 200,
    description: 'User deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  @ApiResponse({
    status: 403,
    description: 'Insufficient permissions',
  })
  async remove(
    @Param('id') id: string,
    @CurrentUser() currentUser: any,
  ): Promise<{ message: string }> {
    try {
      this.logger.log(`Deleting user ${id} by ${currentUser.id}`);
      await this.usersService.remove(id);
      return { message: 'User deleted successfully' };
    } catch (error) {
      this.logger.error(`Error deleting user ${id}`, error);
      throw error;
    }
  }

  @Patch(':id/activate')
  @Permissions('users:update')
  @ApiOperation({ summary: 'Activate user' })
  @ApiParam({
    name: 'id',
    description: 'User ID',
    example: 'clp1234567890abcdef',
  })
  @ApiResponse({
    status: 200,
    description: 'User activated successfully',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  @ApiResponse({
    status: 403,
    description: 'Insufficient permissions',
  })
  async activate(
    @Param('id') id: string,
    @CurrentUser() currentUser: any,
  ): Promise<UserResponseDto> {
    try {
      this.logger.log(`Activating user ${id} by ${currentUser.id}`);
      return await this.usersService.activate(id);
    } catch (error) {
      this.logger.error(`Error activating user ${id}`, error);
      throw error;
    }
  }

  @Patch(':id/deactivate')
  @Permissions('users:update')
  @ApiOperation({ summary: 'Deactivate user' })
  @ApiParam({
    name: 'id',
    description: 'User ID',
    example: 'clp1234567890abcdef',
  })
  @ApiResponse({
    status: 200,
    description: 'User deactivated successfully',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  @ApiResponse({
    status: 403,
    description: 'Insufficient permissions',
  })
  async deactivate(
    @Param('id') id: string,
    @CurrentUser() currentUser: any,
  ): Promise<UserResponseDto> {
    try {
      this.logger.log(`Deactivating user ${id} by ${currentUser.id}`);
      return await this.usersService.deactivate(id);
    } catch (error) {
      this.logger.error(`Error deactivating user ${id}`, error);
      throw error;
    }
  }

  @Patch(':id/suspend')
  @Permissions('users:update')
  @ApiOperation({ summary: 'Suspend user' })
  @ApiParam({
    name: 'id',
    description: 'User ID',
    example: 'clp1234567890abcdef',
  })
  @ApiResponse({
    status: 200,
    description: 'User suspended successfully',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  @ApiResponse({
    status: 403,
    description: 'Insufficient permissions',
  })
  async suspend(
    @Param('id') id: string,
    @CurrentUser() currentUser: any,
  ): Promise<UserResponseDto> {
    try {
      this.logger.log(`Suspending user ${id} by ${currentUser.id}`);
      return await this.usersService.suspend(id);
    } catch (error) {
      this.logger.error(`Error suspending user ${id}`, error);
      throw error;
    }
  }

  @Patch(':id/unsuspend')
  @Permissions('users:update')
  @ApiOperation({ summary: 'Unsuspend user' })
  @ApiParam({
    name: 'id',
    description: 'User ID',
    example: 'clp1234567890abcdef',
  })
  @ApiResponse({
    status: 200,
    description: 'User unsuspended successfully',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  @ApiResponse({
    status: 403,
    description: 'Insufficient permissions',
  })
  async unsuspend(
    @Param('id') id: string,
    @CurrentUser() currentUser: any,
  ): Promise<UserResponseDto> {
    try {
      this.logger.log(`Unsuspending user ${id} by ${currentUser.id}`);
      return await this.usersService.unsuspend(id);
    } catch (error) {
      this.logger.error(`Error unsuspending user ${id}`, error);
      throw error;
    }
  }

  // Role management endpoints
  @Get(':id/roles')
  @Permissions('roles:list')
  @ApiOperation({ summary: 'Get user roles' })
  @ApiParam({
    name: 'id',
    description: 'User ID',
    example: 'clp1234567890abcdef',
  })
  @ApiResponse({
    status: 200,
    description: 'User roles retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  @ApiResponse({
    status: 403,
    description: 'Insufficient permissions',
  })
  async getUserRoles(@Param('id') id: string): Promise<any[]> {
    try {
      return await this.userRoleService.getUserRoles(id);
    } catch (error) {
      this.logger.error(`Error getting roles for user ${id}`, error);
      throw error;
    }
  }

  @Post(':id/roles/:roleId')
  @Permissions('roles:assign')
  @ApiOperation({ summary: 'Assign role to user' })
  @ApiParam({
    name: 'id',
    description: 'User ID',
    example: 'clp1234567890abcdef',
  })
  @ApiParam({
    name: 'roleId',
    description: 'Role ID',
    example: 'clp1234567890abcdef',
  })
  @ApiResponse({
    status: 200,
    description: 'Role assigned successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'User or role not found',
  })
  @ApiResponse({
    status: 403,
    description: 'Insufficient permissions',
  })
  async assignRole(
    @Param('id') id: string,
    @Param('roleId') roleId: string,
    @CurrentUser() currentUser: any,
  ): Promise<{ message: string }> {
    try {
      this.logger.log(`Assigning role ${roleId} to user ${id} by ${currentUser.id}`);
      await this.userRoleService.assignRole(id, roleId);
      return { message: 'Role assigned successfully' };
    } catch (error) {
      this.logger.error(`Error assigning role ${roleId} to user ${id}`, error);
      throw error;
    }
  }

  @Delete(':id/roles/:roleId')
  @Permissions('roles:assign')
  @ApiOperation({ summary: 'Remove role from user' })
  @ApiParam({
    name: 'id',
    description: 'User ID',
    example: 'clp1234567890abcdef',
  })
  @ApiParam({
    name: 'roleId',
    description: 'Role ID',
    example: 'clp1234567890abcdef',
  })
  @ApiResponse({
    status: 200,
    description: 'Role removed successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'User or role not found',
  })
  @ApiResponse({
    status: 403,
    description: 'Insufficient permissions',
  })
  async removeRole(
    @Param('id') id: string,
    @Param('roleId') roleId: string,
    @CurrentUser() currentUser: any,
  ): Promise<{ message: string }> {
    try {
      this.logger.log(`Removing role ${roleId} from user ${id} by ${currentUser.id}`);
      await this.userRoleService.removeRole(id, roleId);
      return { message: 'Role removed successfully' };
    } catch (error) {
      this.logger.error(`Error removing role ${roleId} from user ${id}`, error);
      throw error;
    }
  }
}

