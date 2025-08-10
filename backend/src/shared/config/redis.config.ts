import { registerAs } from '@nestjs/config';

export const redisConfig = registerAs('redis', () => ({
  // Connection settings
  url: process.env.REDIS_URL,
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT, 10) || 6379,
  password: process.env.REDIS_PASSWORD,
  db: parseInt(process.env.REDIS_DB, 10) || 0,
  
  // Connection pool
  maxRetriesPerRequest: parseInt(process.env.REDIS_MAX_RETRIES_PER_REQUEST, 10) || 3,
  retryDelayOnFailover: parseInt(process.env.REDIS_RETRY_DELAY_ON_FAILOVER, 10) || 100,
  connectTimeout: parseInt(process.env.REDIS_CONNECT_TIMEOUT, 10) || 10000,
  commandTimeout: parseInt(process.env.REDIS_COMMAND_TIMEOUT, 10) || 5000,
  
  // Cache settings
  cache: {
    ttl: parseInt(process.env.REDIS_CACHE_TTL, 10) || 300, // 5 minutes
    max: parseInt(process.env.REDIS_CACHE_MAX, 10) || 1000,
  },
  
  // Session store
  session: {
    prefix: process.env.REDIS_SESSION_PREFIX || 'sess:',
    ttl: parseInt(process.env.REDIS_SESSION_TTL, 10) || 86400, // 24 hours
  },
  
  // Rate limiting
  rateLimiting: {
    prefix: process.env.REDIS_RATE_LIMIT_PREFIX || 'rl:',
    ttl: parseInt(process.env.REDIS_RATE_LIMIT_TTL, 10) || 3600, // 1 hour
  },
  
  // Queue settings (for future use)
  queue: {
    prefix: process.env.REDIS_QUEUE_PREFIX || 'queue:',
    defaultJobOptions: {
      removeOnComplete: parseInt(process.env.REDIS_QUEUE_REMOVE_ON_COMPLETE, 10) || 10,
      removeOnFail: parseInt(process.env.REDIS_QUEUE_REMOVE_ON_FAIL, 10) || 50,
      attempts: parseInt(process.env.REDIS_QUEUE_ATTEMPTS, 10) || 3,
      backoff: {
        type: 'exponential',
        delay: parseInt(process.env.REDIS_QUEUE_BACKOFF_DELAY, 10) || 2000,
      },
    },
  },
  
  // Pub/Sub settings
  pubsub: {
    prefix: process.env.REDIS_PUBSUB_PREFIX || 'pubsub:',
  },
  
  // Health check
  healthCheck: {
    enabled: process.env.REDIS_HEALTH_CHECK_ENABLED !== 'false',
    timeout: parseInt(process.env.REDIS_HEALTH_CHECK_TIMEOUT, 10) || 5000,
  },
}));

