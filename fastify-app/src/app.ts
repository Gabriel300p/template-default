import Fastify from "fastify";
import { isDev } from "./config/env.js";
import { registerFeatures } from "./features/index.js";
import corsPlugin from "./plugins/cors.plugin.js";
import loggerPlugin from "./plugins/logger.plugin.js";
import prismaPlugin from "./plugins/prisma.plugin.js";
import securityPlugin from "./plugins/security.plugin.js";
import supabaseAuth from "./plugins/supabase-auth.plugin.js";
import swaggerPlugin from "./plugins/swagger.plugin.js";
import errorHandler from "./shared/errors/error.handler.js";
import passwordResetMiddleware from "./shared/middleware/password-reset.middleware.js";

export async function buildApp() {
  const app = Fastify({
    logger: false, // Disable default logger - we use our custom one
    disableRequestLogging: true,
  });

  // Enhanced logging must be registered first
  await app.register(loggerPlugin);

  // Security headers must be registered early
  await app.register(securityPlugin);

  // CORS must be registered before routes
  await app.register(corsPlugin);

  // Swagger for API documentation
  await app.register(swaggerPlugin);

  await app.register(prismaPlugin);
  await app.register(supabaseAuth);
  await app.register(errorHandler);
  await app.register(passwordResetMiddleware);

  app.get(
    "/health",
    {
      schema: {
        tags: ["Health"],
        summary: "Health check",
        description: "Verifica se a API está funcionando corretamente",
        response: {
          200: {
            type: "object",
            properties: {
              status: { type: "string" },
              timestamp: { type: "string" },
              uptime: { type: "number" },
              environment: { type: "string" },
              version: { type: "string" },
            },
          },
        },
      },
    },
    () => ({
      status: "ok",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: isDev ? "development" : "production",
      version: "1.0.0",
    })
  );

  await registerFeatures(app);

  return app;
}
