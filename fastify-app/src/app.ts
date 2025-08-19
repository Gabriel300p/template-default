import type { FastifyInstance } from 'fastify';
import Fastify from 'fastify';
import { config, logConfig, corsConfig } from './config/index.js';
import prismaPlugin from './shared/plugins/prisma.plugin.js';
import redisPlugin from './shared/plugins/redis.plugin.js';

export interface AppOptions {
  testing?: boolean;
}

export const createApp = async (options: AppOptions = {}): Promise<FastifyInstance> => {
  // Create Fastify instance with optimized settings
  const app = Fastify({
    logger: options.testing ? false : logConfig,
    trustProxy: true,
    disableRequestLogging: false,
    ignoreTrailingSlash: true,
    ignoreDuplicateSlashes: true,
    maxParamLength: 200,
    onProtoPoisoning: 'error',
    onConstructorPoisoning: 'error',
  });

  // Basic error handler
  app.setErrorHandler(async (error: any, request: any, reply: any) => {
    console.error('Unhandled error occurred:', error);
    
    if (error.validation) {
      return reply.status(400).send({
        error: 'Validation Error',
        message: 'Invalid input data',
        details: error.validation,
        statusCode: 400,
      });
    }

    if (error.statusCode && error.statusCode < 500) {
      return reply.status(error.statusCode).send({
        error: error.name || 'Client Error',
        message: error.message,
        statusCode: error.statusCode,
      });
    }

    const isDev = config.NODE_ENV === 'development';
    return reply.status(500).send({
      error: 'Internal Server Error',
      message: isDev ? error.message : 'Something went wrong',
      statusCode: 500,
      ...(isDev && { stack: error.stack }),
    });
  });

  // 404 handler
  app.setNotFoundHandler(async (request: any, reply: any) => {
    return reply.status(404).send({
      error: 'Not Found',
      message: `Route ${request.method} ${request.url} not found`,
      statusCode: 404,
    });
  });

  // Register CORS
  await app.register(import('@fastify/cors'), corsConfig);

  // Register Helmet for security
  await app.register(import('@fastify/helmet'), {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'],
      },
    },
    crossOriginEmbedderPolicy: false,
  });

  // Register rate limiting
  await app.register(import('@fastify/rate-limit'), {
    max: config.RATE_LIMIT_MAX,
    timeWindow: config.RATE_LIMIT_WINDOW,
    errorResponseBuilder: (request: any, context: any) => ({
      error: 'Too Many Requests',
      message: 'Rate limit exceeded, retry later',
      statusCode: 429,
      expiresIn: Math.round(context.ttl / 1000),
    }),
  });

  // Register shared infrastructure plugins
  app.log.info('🔌 Registering infrastructure plugins...');
  
  await app.register(prismaPlugin);
  app.log.info('✅ Prisma plugin registered');
  
  await app.register(redisPlugin);
  app.log.info('✅ Redis plugin registered');

  // Basic health check endpoint
  app.get('/health', async () => {
    const healthData: any = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: '1.0.0',
      environment: config.NODE_ENV,
      services: {},
    };

    // Test database connection
    try {
      await app.prisma.$queryRaw`SELECT 1`;
      healthData.services.database = 'connected';
    } catch (error) {
      app.log.error(error, 'Database health check failed');
      healthData.services.database = 'disconnected';
      healthData.status = 'degraded';
    }

    // Test Redis connection
    try {
      await app.redis.ping();
      healthData.services.redis = 'connected';
    } catch (error) {
      app.log.warn(error, 'Redis health check failed');
      healthData.services.redis = 'unavailable';
      // Redis is optional, so don't mark as degraded
    }

    return healthData;
  });

  // Welcome route
  app.get('/', async () => ({
    message: '🚀 Fastify Template Backend is running!',
    docs: '/docs',
    health: '/health',
    version: '1.0.0',
  }));

  return app;
};

export default createApp;
