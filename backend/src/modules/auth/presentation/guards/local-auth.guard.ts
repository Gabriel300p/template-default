import { Injectable, Logger } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {
  private readonly logger = new Logger(LocalAuthGuard.name);

  handleRequest(err: any, user: any, info: any) {
    if (err || !user) {
      this.logger.warn(`Local authentication failed: ${info?.message || err?.message || 'Unknown error'}`);
      throw err || new Error('Authentication failed');
    }

    return user;
  }
}

