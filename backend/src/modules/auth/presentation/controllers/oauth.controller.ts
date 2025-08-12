import {
  Controller,
  Get,
  UseGuards,
  Request,
  Response,
  Logger,
  Post,
  Body,
  Delete,
  Param,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';

// Services
import { OAuthService } from '../../application/services/oauth.service';

// Guards
import { GoogleAuthGuard } from '../guards/google-auth.guard';
import { GitHubAuthGuard } from '../guards/github-auth.guard';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

// Decorators
import { Public } from '@/shared/common/decorators/public.decorator';
import { CurrentUser } from '@/shared/common/decorators/current-user.decorator';

@ApiTags('OAuth2')
@Controller('auth/oauth')
export class OAuthController {
  private readonly logger = new Logger(OAuthController.name);

  constructor(
    private readonly oauthService: OAuthService,
    private readonly configService: ConfigService,
  ) {}

  // Google OAuth
  @Public()
  @Get('google')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: 'Initiate Google OAuth login' })
  @ApiResponse({
    status: 302,
    description: 'Redirect to Google OAuth',
  })
  async googleAuth(): Promise<void> {
    // This endpoint initiates the Google OAuth flow
    // The actual logic is handled by the GoogleAuthGuard
  }

  @Public()
  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: 'Google OAuth callback' })
  @ApiResponse({
    status: 302,
    description: 'Redirect to frontend with tokens',
  })
  async googleAuthCallback(@Request() req: any, @Response() res: any): Promise<void> {
    try {
      const result = req.user;
      const frontendUrl = this.configService.get<string>('FRONTEND_URL', 'http://localhost:3000');
      
      // Redirect to frontend with tokens
      const redirectUrl = `${frontendUrl}/auth/callback?` +
        `access_token=${result.accessToken}&` +
        `refresh_token=${result.refreshToken}&` +
        `token_type=${result.tokenType}&` +
        `expires_in=${result.expiresIn}`;

      this.logger.log(`Google OAuth successful for user: ${result.user.id}`);
      res.redirect(redirectUrl);
    } catch (error) {
      this.logger.error('Google OAuth callback error', error);
      const frontendUrl = this.configService.get<string>('FRONTEND_URL', 'http://localhost:3000');
      res.redirect(`${frontendUrl}/auth/error?error=oauth_failed`);
    }
  }

  // GitHub OAuth
  @Public()
  @Get('github')
  @UseGuards(GitHubAuthGuard)
  @ApiOperation({ summary: 'Initiate GitHub OAuth login' })
  @ApiResponse({
    status: 302,
    description: 'Redirect to GitHub OAuth',
  })
  async githubAuth(): Promise<void> {
    // This endpoint initiates the GitHub OAuth flow
    // The actual logic is handled by the GitHubAuthGuard
  }

  @Public()
  @Get('github/callback')
  @UseGuards(GitHubAuthGuard)
  @ApiOperation({ summary: 'GitHub OAuth callback' })
  @ApiResponse({
    status: 302,
    description: 'Redirect to frontend with tokens',
  })
  async githubAuthCallback(@Request() req: any, @Response() res: any): Promise<void> {
    try {
      const result = req.user;
      const frontendUrl = this.configService.get<string>('FRONTEND_URL', 'http://localhost:3000');
      
      // Redirect to frontend with tokens
      const redirectUrl = `${frontendUrl}/auth/callback?` +
        `access_token=${result.accessToken}&` +
        `refresh_token=${result.refreshToken}&` +
        `token_type=${result.tokenType}&` +
        `expires_in=${result.expiresIn}`;

      this.logger.log(`GitHub OAuth successful for user: ${result.user.id}`);
      res.redirect(redirectUrl);
    } catch (error) {
      this.logger.error('GitHub OAuth callback error', error);
      const frontendUrl = this.configService.get<string>('FRONTEND_URL', 'http://localhost:3000');
      res.redirect(`${frontendUrl}/auth/error?error=oauth_failed`);
    }
  }

  // Provider management for authenticated users
  @UseGuards(JwtAuthGuard)
  @Get('providers')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get user OAuth providers' })
  @ApiResponse({
    status: 200,
    description: 'OAuth providers retrieved successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async getUserProviders(@CurrentUser() user: any): Promise<any> {
    try {
      const providers = await this.oauthService.getUserProviders(user.id);
      return {
        providers,
        availableProviders: this.getAvailableProviders(),
      };
    } catch (error) {
      this.logger.error(`Get providers failed for user ${user.id}`, error);
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard)
  @Delete('providers/:provider')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Unlink OAuth provider' })
  @ApiParam({
    name: 'provider',
    description: 'OAuth provider name',
    enum: ['google', 'github', 'microsoft'],
  })
  @ApiResponse({
    status: 200,
    description: 'Provider unlinked successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Cannot unlink the only authentication method',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async unlinkProvider(
    @CurrentUser() user: any,
    @Param('provider') provider: string,
  ): Promise<{ message: string }> {
    try {
      await this.oauthService.unlinkOAuthProvider(user.id, provider);
      this.logger.log(`Provider ${provider} unlinked for user ${user.id}`);
      return { message: `${provider} provider unlinked successfully` };
    } catch (error) {
      this.logger.error(`Unlink provider failed for user ${user.id}`, error);
      throw error;
    }
  }

  // OAuth status endpoints
  @Public()
  @Get('status')
  @ApiOperation({ summary: 'Get OAuth providers status' })
  @ApiResponse({
    status: 200,
    description: 'OAuth status retrieved successfully',
  })
  async getOAuthStatus(): Promise<any> {
    return {
      providers: this.getAvailableProviders(),
    };
  }

  private getAvailableProviders(): any {
    return {
      google: {
        enabled: this.oauthService.isOAuthEnabled('google'),
        name: 'Google',
        icon: 'google',
        color: '#4285f4',
      },
      github: {
        enabled: this.oauthService.isOAuthEnabled('github'),
        name: 'GitHub',
        icon: 'github',
        color: '#333',
      },
      microsoft: {
        enabled: this.oauthService.isOAuthEnabled('microsoft'),
        name: 'Microsoft',
        icon: 'microsoft',
        color: '#00a1f1',
      },
    };
  }
}

