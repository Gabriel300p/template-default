import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';

export enum Role {
  ADMIN = 'admin',
  USER = 'user',
  MODERATOR = 'moderator',
}

export enum Permission {
  READ_USERS = 'read:users',
  WRITE_USERS = 'write:users',
  DELETE_USERS = 'delete:users',
  READ_COMUNICACOES = 'read:comunicacoes',
  WRITE_COMUNICACOES = 'write:comunicacoes',
  DELETE_COMUNICACOES = 'delete:comunicacoes',
  ADMIN_SYSTEM = 'admin:system',
  MODERATE_CONTENT = 'moderate:content',
}

@Injectable()
export class RolesGuard implements CanActivate {
  private readonly logger = new Logger(RolesGuard.name);

  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const requiredPermissions = this.reflector.getAllAndOverride<Permission[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    // If no roles or permissions are required, allow access
    if (!requiredRoles && !requiredPermissions) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const requestId = request.requestId;

    if (!user) {
      this.logger.warn('No user found in request for role/permission check', {
        requestId,
        url: request.url,
        method: request.method,
      });
      throw new ForbiddenException('Usuário não autenticado');
    }

    const userRoles = user.roles || [];
    const userPermissions = user.permissions || [];

    // Check roles
    if (requiredRoles) {
      const hasRole = requiredRoles.some((role) => userRoles.includes(role));
      if (!hasRole) {
        this.logger.warn(
          `Access denied: User ${user.email} lacks required roles`,
          {
            requestId,
            userId: user.id,
            email: user.email,
            userRoles,
            requiredRoles,
            url: request.url,
            method: request.method,
          },
        );
        throw new ForbiddenException(
          'Você não possui as permissões necessárias para acessar este recurso',
        );
      }
    }

    // Check permissions
    if (requiredPermissions) {
      const hasPermission = requiredPermissions.some((permission) =>
        userPermissions.includes(permission),
      );
      if (!hasPermission) {
        this.logger.warn(
          `Access denied: User ${user.email} lacks required permissions`,
          {
            requestId,
            userId: user.id,
            email: user.email,
            userPermissions,
            requiredPermissions,
            url: request.url,
            method: request.method,
          },
        );
        throw new ForbiddenException(
          'Você não possui as permissões necessárias para acessar este recurso',
        );
      }
    }

    this.logger.log(
      `Access granted: User ${user.email} has required roles/permissions`,
      {
        requestId,
        userId: user.id,
        email: user.email,
        userRoles,
        userPermissions,
        requiredRoles,
        requiredPermissions,
      },
    );

    return true;
  }
}

