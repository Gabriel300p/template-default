import { Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { OAuthService, OAuthProfile } from '../../application/services/oauth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  private readonly logger = new Logger(GoogleStrategy.name);

  constructor(
    private readonly oauthService: OAuthService,
    private readonly configService: ConfigService,
  ) {
    super({
      clientID: configService.get<string>('GOOGLE_CLIENT_ID'),
      clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET'),
      callbackURL: configService.get<string>('GOOGLE_CALLBACK_URL'),
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    try {
      if (!this.oauthService.isOAuthEnabled('google')) {
        this.logger.warn('Google OAuth is disabled');
        return done(new Error('Google OAuth is disabled'), null);
      }

      const oauthProfile: OAuthProfile = {
        id: profile.id,
        email: profile.emails[0].value,
        firstName: profile.name.givenName,
        lastName: profile.name.familyName,
        avatar: profile.photos[0]?.value,
        provider: 'google',
      };

      const result = await this.oauthService.handleOAuthLogin(oauthProfile);
      
      this.logger.log(`Google OAuth login successful for user: ${result.user.id}`);
      return done(null, result);
    } catch (error) {
      this.logger.error('Error in Google OAuth validation', error);
      return done(error, null);
    }
  }
}

