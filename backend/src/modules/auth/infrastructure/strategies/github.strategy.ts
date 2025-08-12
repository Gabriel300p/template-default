import { Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { Strategy, VerifyCallback } from 'passport-github2';
import { OAuthService, OAuthProfile } from '../../application/services/oauth.service';

@Injectable()
export class GitHubStrategy extends PassportStrategy(Strategy, 'github') {
  private readonly logger = new Logger(GitHubStrategy.name);

  constructor(
    private readonly oauthService: OAuthService,
    private readonly configService: ConfigService,
  ) {
    super({
      clientID: configService.get<string>('GITHUB_CLIENT_ID'),
      clientSecret: configService.get<string>('GITHUB_CLIENT_SECRET'),
      callbackURL: configService.get<string>('GITHUB_CALLBACK_URL'),
      scope: ['user:email'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    try {
      if (!this.oauthService.isOAuthEnabled('github')) {
        this.logger.warn('GitHub OAuth is disabled');
        return done(new Error('GitHub OAuth is disabled'), null);
      }

      const email = profile.emails?.[0]?.value || profile._json.email;
      
      if (!email) {
        this.logger.warn('No email found in GitHub profile');
        return done(new Error('No email found in GitHub profile'), null);
      }

      const oauthProfile: OAuthProfile = {
        id: profile.id,
        email: email,
        firstName: profile.displayName?.split(' ')[0] || profile.username,
        lastName: profile.displayName?.split(' ').slice(1).join(' ') || '',
        avatar: profile.photos[0]?.value,
        provider: 'github',
      };

      const result = await this.oauthService.handleOAuthLogin(oauthProfile);
      
      this.logger.log(`GitHub OAuth login successful for user: ${result.user.id}`);
      return done(null, result);
    } catch (error) {
      this.logger.error('Error in GitHub OAuth validation', error);
      return done(error, null);
    }
  }
}

