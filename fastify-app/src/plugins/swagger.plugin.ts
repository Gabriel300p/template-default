import swagger from "@fastify/swagger";
import swaggerUI from "@fastify/swagger-ui";
import fp from "fastify-plugin";
import { env } from "../config/env.js";

export default fp(async (app) => {
  // Register Swagger
  await app.register(swagger, {
    openapi: {
      openapi: "3.0.0",
      info: {
        title: "Barbershop API",
        description:
          "API para sistema de barbearia com autenticação e agendamentos",
        version: "1.0.0",
        contact: {
          name: "API Support",
          email: "support@barbershop.com",
        },
        license: {
          name: "MIT",
          url: "https://opensource.org/licenses/MIT",
        },
      },
      servers: [
        {
          url: `http://${env.HOST}:${env.PORT}`,
          description: "Development server",
        },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
            description: "JWT token from Supabase authentication",
          },
        },
      },
      security: [
        {
          bearerAuth: [],
        },
      ],
      tags: [
        {
          name: "Health",
          description: "Health check endpoints",
        },
        {
          name: "Auth",
          description: "Authentication and user management",
        },
        {
          name: "Barbershop",
          description: "Barbershop management",
        },
      ],
    },
  });

  // Register Swagger UI
  await app.register(swaggerUI, {
    routePrefix: "/docs",
    uiConfig: {
      docExpansion: "list",
      deepLinking: true,
      defaultModelRendering: "model",
    },
    uiHooks: {
      onRequest: function (request, reply, next) {
        next();
      },
      preHandler: function (request, reply, next) {
        next();
      },
    },
    staticCSP: true,
    transformStaticCSP: (header) => header,
    transformSpecification: (swaggerObject) => {
      return swaggerObject;
    },
    transformSpecificationClone: true,
  });
});
