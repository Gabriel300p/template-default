import { Injectable, Logger } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class GitHubAuthGuard extends AuthGuard('github') {
  private readonly logger = new Logger(GitHubAuthGuard.name);

  handleRequest(err: any, user: any, info: any) {
    if (err || !user) {
      this.logger.warn(`GitHub OAuth authentication failed: ${info?.message || err?.message || 'Unknown error'}`);
      throw err || new Error('GitHub OAuth authentication failed');
    }

    return user;
  }
}

