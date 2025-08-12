import {
  Controller,
  Get,
  Patch,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  Logger,
  Post,
  Delete,
  UploadedFile,
  UseInterceptors,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { Throttle } from '@nestjs/throttler';

// Services
import { UserProfileService } from '../../application/services/user-profile.service';

// DTOs
import { UpdateUserProfileDto } from '../dto/update-user.dto';
import { UserResponseDto } from '../dto/user-response.dto';

// Guards
import { JwtAuthGuard } from '@/modules/auth/presentation/guards/jwt-auth.guard';

// Decorators
import { CurrentUser } from '@/shared/common/decorators/current-user.decorator';

@ApiTags('User Profile')
@Controller('profile')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class UserProfileController {
  private readonly logger = new Logger(UserProfileController.name);

  constructor(private readonly userProfileService: UserProfileService) {}

  @Get()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({
    status: 200,
    description: 'Profile retrieved successfully',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async getProfile(@CurrentUser() user: any): Promise<UserResponseDto> {
    try {
      return await this.userProfileService.getProfile(user.id);
    } catch (error) {
      this.logger.error(`Error getting profile for user ${user.id}`, error);
      throw error;
    }
  }

  @Patch()
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 updates per minute
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiResponse({
    status: 200,
    description: 'Profile updated successfully',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid profile data',
  })
  @ApiResponse({
    status: 409,
    description: 'Email or username already exists',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async updateProfile(
    @CurrentUser() user: any,
    @Body() updateProfileDto: UpdateUserProfileDto,
  ): Promise<UserResponseDto> {
    try {
      this.logger.log(`Updating profile for user ${user.id}`);
      return await this.userProfileService.updateProfile(user.id, updateProfileDto);
    } catch (error) {
      this.logger.error(`Error updating profile for user ${user.id}`, error);
      throw error;
    }
  }

  @Get('summary')
  @ApiOperation({ summary: 'Get profile summary with additional information' })
  @ApiResponse({
    status: 200,
    description: 'Profile summary retrieved successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async getProfileSummary(@CurrentUser() user: any): Promise<any> {
    try {
      return await this.userProfileService.getProfileSummary(user.id);
    } catch (error) {
      this.logger.error(`Error getting profile summary for user ${user.id}`, error);
      throw error;
    }
  }

  @Post('avatar')
  @UseInterceptors(FileInterceptor('avatar'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload user avatar' })
  @ApiBody({
    description: 'Avatar image file',
    type: 'multipart/form-data',
    schema: {
      type: 'object',
      properties: {
        avatar: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Avatar uploaded successfully',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid file format or size',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async uploadAvatar(
    @CurrentUser() user: any,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<UserResponseDto> {
    try {
      if (!file) {
        throw new Error('No file uploaded');
      }

      // In a real implementation, you would:
      // 1. Validate file type and size
      // 2. Upload to cloud storage (AWS S3, Cloudinary, etc.)
      // 3. Get the public URL
      // For now, we'll simulate with a placeholder URL
      const avatarUrl = `https://example.com/avatars/${user.id}/${file.filename}`;

      this.logger.log(`Uploading avatar for user ${user.id}`);
      return await this.userProfileService.uploadAvatar(user.id, avatarUrl);
    } catch (error) {
      this.logger.error(`Error uploading avatar for user ${user.id}`, error);
      throw error;
    }
  }

  @Delete('avatar')
  @ApiOperation({ summary: 'Remove user avatar' })
  @ApiResponse({
    status: 200,
    description: 'Avatar removed successfully',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async removeAvatar(@CurrentUser() user: any): Promise<UserResponseDto> {
    try {
      this.logger.log(`Removing avatar for user ${user.id}`);
      return await this.userProfileService.removeAvatar(user.id);
    } catch (error) {
      this.logger.error(`Error removing avatar for user ${user.id}`, error);
      throw error;
    }
  }

  @Post('verify-email')
  @Throttle({ default: { limit: 3, ttl: 300000 } }) // 3 attempts per 5 minutes
  @ApiOperation({ summary: 'Verify user email' })
  @ApiResponse({
    status: 200,
    description: 'Email verified successfully',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 429,
    description: 'Too many verification attempts',
  })
  async verifyEmail(@CurrentUser() user: any): Promise<UserResponseDto> {
    try {
      // In a real implementation, you would:
      // 1. Generate verification token
      // 2. Send verification email
      // 3. Verify token when user clicks link
      // For now, we'll directly verify the email
      this.logger.log(`Verifying email for user ${user.id}`);
      return await this.userProfileService.verifyEmail(user.id);
    } catch (error) {
      this.logger.error(`Error verifying email for user ${user.id}`, error);
      throw error;
    }
  }

  @Get('activity')
  @ApiOperation({ summary: 'Get user activity log' })
  @ApiResponse({
    status: 200,
    description: 'Activity log retrieved successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async getActivityLog(
    @CurrentUser() user: any,
    @Query('limit') limit?: number,
  ): Promise<any[]> {
    try {
      const activityLimit = Math.min(limit || 50, 100); // Max 100 items
      return await this.userProfileService.getActivityLog(user.id, activityLimit);
    } catch (error) {
      this.logger.error(`Error getting activity log for user ${user.id}`, error);
      throw error;
    }
  }

  @Get('sessions')
  @ApiOperation({ summary: 'Get user active sessions' })
  @ApiResponse({
    status: 200,
    description: 'Active sessions retrieved successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async getActiveSessions(@CurrentUser() user: any): Promise<any[]> {
    try {
      const summary = await this.userProfileService.getProfileSummary(user.id);
      return summary.recentSessions;
    } catch (error) {
      this.logger.error(`Error getting active sessions for user ${user.id}`, error);
      throw error;
    }
  }

  @Get('providers')
  @ApiOperation({ summary: 'Get linked OAuth providers' })
  @ApiResponse({
    status: 200,
    description: 'Linked providers retrieved successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async getLinkedProviders(@CurrentUser() user: any): Promise<any[]> {
    try {
      const summary = await this.userProfileService.getProfileSummary(user.id);
      return summary.linkedProviders;
    } catch (error) {
      this.logger.error(`Error getting linked providers for user ${user.id}`, error);
      throw error;
    }
  }
}

