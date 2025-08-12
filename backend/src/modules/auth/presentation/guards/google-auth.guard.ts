import { Injectable, Logger } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {
  private readonly logger = new Logger(GoogleAuthGuard.name);

  handleRequest(err: any, user: any, info: any) {
    if (err || !user) {
      this.logger.warn(`Google OAuth authentication failed: ${info?.message || err?.message || 'Unknown error'}`);
      throw err || new Error('Google OAuth authentication failed');
    }

    return user;
  }
}

