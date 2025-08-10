import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(JwtAuthGuard.name);

  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    // Check if route is marked as public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const requestId = request.requestId;

    if (err || !user) {
      this.logger.warn(
        `Authentication failed: ${info?.message || 'Unknown error'}`,
        {
          requestId,
          url: request.url,
          method: request.method,
          ip: request.ip,
          userAgent: request.get('User-Agent'),
          error: err?.message,
          info: info?.message,
        },
      );

      throw (
        err ||
        new UnauthorizedException(
          info?.message || 'Token de acesso inválido ou expirado',
        )
      );
    }

    // Log successful authentication
    this.logger.log(
      `User authenticated successfully: ${user.email}`,
      {
        requestId,
        userId: user.id,
        email: user.email,
        roles: user.roles,
        url: request.url,
        method: request.method,
      },
    );

    return user;
  }
}

