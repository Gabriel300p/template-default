import { PrismaClient } from "@prisma/client";
import type { FastifyInstance } from "fastify";
import fp from "fastify-plugin";

// Use a single instance to avoid connection issues
const prisma = new PrismaClient({
  log: ["query", "info", "warn", "error"],
  datasources: {
    db: {
      url: process.env.DATABASE_URL + "?prepare=false",
    },
  },
});

declare module "fastify" {
  interface FastifyInstance {
    prisma: PrismaClient;
  }
}

async function prismaPlugin(fastify: FastifyInstance) {
  // Register the Prisma client as a Fastify decorator
  fastify.decorate("prisma", prisma);

  // Add a graceful shutdown hook
  fastify.addHook("onClose", async () => {
    await prisma.$disconnect();
  });

  // Force disconnect and reconnect to clear any cached prepared statements
  try {
    await prisma.$disconnect();
    await prisma.$connect();
    fastify.log.info("✅ Database connected successfully");
  } catch (error) {
    fastify.log.error({ err: error }, "❌ Database connection failed");
    throw error;
  }
}

export default fp(prismaPlugin, {
  name: "prisma",
});
