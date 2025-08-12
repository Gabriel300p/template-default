import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  Get,
  Patch,
  Logger,
  Ip,
  Headers,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';

// Services
import { AuthService } from '../../application/services/auth.service';

// DTOs
import { LoginDto, LoginResponseDto } from '../dto/login.dto';
import { RegisterDto, RegisterResponseDto } from '../dto/register.dto';
import { RefreshTokenDto, RefreshTokenResponseDto } from '../dto/refresh-token.dto';
import { ChangePasswordDto } from '../dto/change-password.dto';

// Guards
import { LocalAuthGuard } from '../guards/local-auth.guard';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

// Decorators
import { Public } from '@/shared/common/decorators/public.decorator';
import { CurrentUser } from '@/shared/common/decorators/current-user.decorator';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 attempts per minute
  @ApiOperation({ summary: 'User login' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    type: LoginResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid credentials',
  })
  @ApiResponse({
    status: 429,
    description: 'Too many login attempts',
  })
  async login(
    @Body() loginDto: LoginDto,
    @Ip() ipAddress: string,
    @Headers('user-agent') userAgent: string,
  ): Promise<LoginResponseDto> {
    try {
      this.logger.log(`Login attempt for email: ${loginDto.email} from IP: ${ipAddress}`);
      return await this.authService.login(loginDto, ipAddress, userAgent);
    } catch (error) {
      this.logger.error(`Login failed for email: ${loginDto.email}`, error);
      throw error;
    }
  }

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @Throttle({ default: { limit: 3, ttl: 60000 } }) // 3 attempts per minute
  @ApiOperation({ summary: 'User registration' })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({
    status: 201,
    description: 'Registration successful',
    type: RegisterResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid registration data',
  })
  @ApiResponse({
    status: 409,
    description: 'User already exists',
  })
  @ApiResponse({
    status: 429,
    description: 'Too many registration attempts',
  })
  async register(@Body() registerDto: RegisterDto): Promise<RegisterResponseDto> {
    try {
      this.logger.log(`Registration attempt for email: ${registerDto.email}`);
      return await this.authService.register(registerDto);
    } catch (error) {
      this.logger.error(`Registration failed for email: ${registerDto.email}`, error);
      throw error;
    }
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 attempts per minute
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiBody({ type: RefreshTokenDto })
  @ApiResponse({
    status: 200,
    description: 'Token refreshed successfully',
    type: RefreshTokenResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid refresh token',
  })
  @ApiResponse({
    status: 429,
    description: 'Too many refresh attempts',
  })
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto): Promise<RefreshTokenResponseDto> {
    try {
      return await this.authService.refreshToken(refreshTokenDto.refreshToken);
    } catch (error) {
      this.logger.error('Token refresh failed', error);
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'User logout' })
  @ApiResponse({
    status: 200,
    description: 'Logout successful',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async logout(
    @CurrentUser() user: any,
    @Headers('authorization') authHeader: string,
  ): Promise<{ message: string }> {
    try {
      const token = authHeader?.replace('Bearer ', '');
      await this.authService.logout(user.id, token);
      this.logger.log(`User ${user.id} logged out`);
      return { message: 'Logout successful' };
    } catch (error) {
      this.logger.error(`Logout failed for user ${user.id}`, error);
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout-all')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Logout from all devices' })
  @ApiResponse({
    status: 200,
    description: 'Logout from all devices successful',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async logoutAll(@CurrentUser() user: any): Promise<{ message: string }> {
    try {
      await this.authService.logoutAll(user.id);
      this.logger.log(`User ${user.id} logged out from all devices`);
      return { message: 'Logout from all devices successful' };
    } catch (error) {
      this.logger.error(`Logout all failed for user ${user.id}`, error);
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard)
  @Patch('change-password')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 3, ttl: 300000 } }) // 3 attempts per 5 minutes
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Change user password' })
  @ApiBody({ type: ChangePasswordDto })
  @ApiResponse({
    status: 200,
    description: 'Password changed successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid password data',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized or invalid current password',
  })
  @ApiResponse({
    status: 429,
    description: 'Too many password change attempts',
  })
  async changePassword(
    @CurrentUser() user: any,
    @Body() changePasswordDto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    try {
      await this.authService.changePassword(user.id, changePasswordDto);
      this.logger.log(`Password changed for user ${user.id}`);
      return { message: 'Password changed successfully' };
    } catch (error) {
      this.logger.error(`Password change failed for user ${user.id}`, error);
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({
    status: 200,
    description: 'User profile retrieved successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async getProfile(@CurrentUser() user: any): Promise<any> {
    try {
      const { password, ...userProfile } = user;
      return {
        user: userProfile,
      };
    } catch (error) {
      this.logger.error(`Get profile failed for user ${user.id}`, error);
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('verify')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Verify JWT token' })
  @ApiResponse({
    status: 200,
    description: 'Token is valid',
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid token',
  })
  async verifyToken(@CurrentUser() user: any): Promise<{ valid: boolean; user: any }> {
    try {
      const { password, ...userProfile } = user;
      return {
        valid: true,
        user: userProfile,
      };
    } catch (error) {
      this.logger.error(`Token verification failed`, error);
      throw error;
    }
  }
}

