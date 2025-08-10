import { SetMetadata } from '@nestjs/common';

export const CACHE_KEY_METADATA = 'cache_key';
export const CACHE_TTL_METADATA = 'cache_ttl';

/**
 * Decorator to enable caching for an endpoint
 * 
 * @param key - Cache key identifier
 * @param ttl - Time to live in milliseconds (default: 5 minutes)
 * 
 * @example
 * ```typescript
 * @CacheResult('users_list', 300000) // Cache for 5 minutes
 * @Get('users')
 * getUsers() {
 *   return this.usersService.findAll();
 * }
 * ```
 */
export const CacheResult = (key: string, ttl: number = 300000) => {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    SetMetadata(CACHE_KEY_METADATA, key)(target, propertyKey, descriptor);
    SetMetadata(CACHE_TTL_METADATA, ttl)(target, propertyKey, descriptor);
  };
};

