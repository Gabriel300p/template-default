import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import fp from 'fastify-plugin';
import fastifyRedis from '@fastify/redis';
import { config } from '../../config/index.js';

export interface RedisPluginOptions {
  // Add any specific options for Redis plugin
}

const redisPlugin = async (
  fastify: FastifyInstance,
  options: FastifyPluginOptions & RedisPluginOptions
) => {
  try {
    // Register the official @fastify/redis plugin
    await fastify.register(fastifyRedis, {
      host: config.REDIS_HOST,
      port: config.REDIS_PORT,
      family: 4, // 4 (IPv4) or 6 (IPv6)
      keepAlive: 30000,
      lazyConnect: true,
      maxRetriesPerRequest: 3,
    });

    // Test the connection
    await fastify.redis.ping();
    fastify.log.info('✅ Redis connected successfully');

  } catch (error) {
    // Redis is optional for development, so we'll log a warning instead of throwing
    fastify.log.warn(error, '⚠️ Redis connection failed - continuing without cache');
    
    // The @fastify/redis plugin handles connection failures gracefully
    // If Redis is not available, the plugin will still be registered but commands will fail
    fastify.log.info('🔧 Continuing without Redis cache for development');
  }
};

// Export as fastify plugin
export default fp(redisPlugin, {
  name: 'redis',
  dependencies: [],
});

export { redisPlugin };
