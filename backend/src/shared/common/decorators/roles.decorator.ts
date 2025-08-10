import { SetMetadata } from '@nestjs/common';
import { Role } from '../guards/roles.guard';

export const ROLES_KEY = 'roles';

/**
 * Decorator to specify required roles for accessing an endpoint
 * 
 * @param roles - Array of roles required to access the endpoint
 * 
 * @example
 * ```typescript
 * @Roles(Role.ADMIN, Role.MODERATOR)
 * @Get('admin-only')
 * getAdminData() {
 *   return { message: 'Admin only data' };
 * }
 * ```
 */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);

