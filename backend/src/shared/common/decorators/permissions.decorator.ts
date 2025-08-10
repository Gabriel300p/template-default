import { SetMetadata } from '@nestjs/common';
import { Permission } from '../guards/roles.guard';

export const PERMISSIONS_KEY = 'permissions';

/**
 * Decorator to specify required permissions for accessing an endpoint
 * 
 * @param permissions - Array of permissions required to access the endpoint
 * 
 * @example
 * ```typescript
 * @RequirePermissions(Permission.READ_USERS, Permission.WRITE_USERS)
 * @Get('users')
 * getUsers() {
 *   return { message: 'Users data' };
 * }
 * ```
 */
export const RequirePermissions = (...permissions: Permission[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);

