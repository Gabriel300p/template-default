import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import fp from 'fastify-plugin';
import { PrismaClient } from '@prisma/client';
import { config } from '../../config/index.js';

// Declare module augmentation for Fastify to include Prisma
declare module 'fastify' {
  interface FastifyInstance {
    prisma: PrismaClient;
  }
}

export interface PrismaPluginOptions {
  // Add any specific options for Prisma plugin
}

const prismaPlugin = async (
  fastify: FastifyInstance,
  options: FastifyPluginOptions & PrismaPluginOptions
) => {
  try {
    // Create Prisma client with connection pooling for better performance
    const prisma = new PrismaClient({
      log: config.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
      datasources: {
        db: {
          url: config.DATABASE_URL,
        },
      },
    });

    // Test the connection
    await prisma.$connect();
    fastify.log.info('✅ Database connected successfully');

    // Decorate Fastify instance with Prisma client
    fastify.decorate('prisma', prisma);

    // Graceful shutdown - close Prisma connection
    fastify.addHook('onClose', async (instance) => {
      await instance.prisma.$disconnect();
      fastify.log.info('📦 Database connection closed');
    });

  } catch (error) {
    fastify.log.error(error, '❌ Failed to connect to database');
    throw error;
  }
};

// Export as fastify plugin
export default fp(prismaPlugin, {
  name: 'prisma',
  dependencies: [],
});

export { prismaPlugin };
