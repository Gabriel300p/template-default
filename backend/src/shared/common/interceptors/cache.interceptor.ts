import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CACHE_KEY_METADATA, CACHE_TTL_METADATA } from '@nestjs/cache-manager';

@Injectable()
export class CacheInterceptor implements NestInterceptor {
  private readonly logger = new Logger(CacheInterceptor.name);
  private readonly cache = new Map<string, { data: any; expiry: number }>();

  constructor(private reflector: Reflector) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const requestId = request.requestId;

    // Only cache GET requests
    if (request.method !== 'GET') {
      return next.handle();
    }

    // Check if caching is enabled for this route
    const cacheKey = this.reflector.get<string>(
      CACHE_KEY_METADATA,
      context.getHandler(),
    );
    const cacheTTL = this.reflector.get<number>(
      CACHE_TTL_METADATA,
      context.getHandler(),
    );

    if (!cacheKey) {
      return next.handle();
    }

    // Generate cache key including query parameters
    const fullCacheKey = this.generateCacheKey(cacheKey, request);

    // Check if data is in cache and not expired
    const cachedData = this.cache.get(fullCacheKey);
    if (cachedData && cachedData.expiry > Date.now()) {
      this.logger.log(`Cache hit for key: ${fullCacheKey}`, {
        requestId,
        cacheKey: fullCacheKey,
        url: request.url,
      });
      return of(cachedData.data);
    }

    // Data not in cache or expired, fetch from source
    return next.handle().pipe(
      tap((data) => {
        const ttl = cacheTTL || 300000; // Default 5 minutes
        const expiry = Date.now() + ttl;

        this.cache.set(fullCacheKey, { data, expiry });

        this.logger.log(`Data cached for key: ${fullCacheKey}`, {
          requestId,
          cacheKey: fullCacheKey,
          ttl,
          url: request.url,
        });

        // Clean up expired entries periodically
        this.cleanupExpiredEntries();
      }),
    );
  }

  private generateCacheKey(baseKey: string, request: any): string {
    const queryString = new URLSearchParams(request.query).toString();
    const userId = request.user?.id || 'anonymous';
    
    return `${baseKey}:${userId}:${queryString}`;
  }

  private cleanupExpiredEntries(): void {
    const now = Date.now();
    let cleanedCount = 0;

    for (const [key, value] of this.cache.entries()) {
      if (value.expiry <= now) {
        this.cache.delete(key);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      this.logger.debug(`Cleaned up ${cleanedCount} expired cache entries`);
    }
  }

  /**
   * Clear cache entries by pattern
   */
  clearCacheByPattern(pattern: string): void {
    let clearedCount = 0;

    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
        clearedCount++;
      }
    }

    this.logger.log(`Cleared ${clearedCount} cache entries matching pattern: ${pattern}`);
  }

  /**
   * Clear all cache entries
   */
  clearAllCache(): void {
    const size = this.cache.size;
    this.cache.clear();
    this.logger.log(`Cleared all ${size} cache entries`);
  }
}

