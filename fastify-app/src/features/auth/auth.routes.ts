import { FastifyInstance } from "fastify";
import { UnauthorizedError } from "../../shared/errors/app-errors.js";
import { zodToJsonSchema } from "../../shared/utils/swagger.utils.js";
import { AuthController } from "./controllers/auth.controller.js";
import {
  confirmEmailResponseSchema,
  confirmEmailSchema,
  profileUpdateResponseSchema,
  profileUpdateSchema,
  resetPasswordResponseSchema,
  resetPasswordSchema,
  verifyMfaResponseSchema,
  verifyMfaSchema,
} from "./models/auth.models.js";
import { AuthService } from "./services/auth.service.js";

// Auth middleware using currentUser from supabase plugin
async function requireAuth(request: any, reply: any) {
  if (!request.currentUser) {
    throw new UnauthorizedError("Authentication required");
  }
}

export async function authFeature(app: FastifyInstance) {
  const authService = new AuthService(app.prisma);
  const authController = new AuthController(authService);

  // GET /auth/profile - Get user profile (requires auth)
  app.get("/auth/profile", {
    schema: {
      tags: ["Auth"],
      summary: "Get user profile",
      description: "Retorna o perfil do usuário autenticado",
      security: [{ bearerAuth: [] }],
      response: {
        200: zodToJsonSchema(profileUpdateResponseSchema),
        401: {
          type: "object",
          properties: {
            error: { type: "string" },
            message: { type: "string" },
          },
        },
      },
    },
    preHandler: [requireAuth],
    handler: authController.getProfile.bind(authController),
  });

  // PATCH /auth/profile - Update user profile (requires auth)
  app.patch("/auth/profile", {
    schema: {
      tags: ["Auth"],
      summary: "Update user profile",
      description: "Atualiza informações do perfil do usuário",
      security: [{ bearerAuth: [] }],
      body: zodToJsonSchema(profileUpdateSchema),
      response: {
        200: zodToJsonSchema(profileUpdateResponseSchema),
        400: {
          type: "object",
          properties: {
            error: { type: "string" },
            message: { type: "string" },
          },
        },
        401: {
          type: "object",
          properties: {
            error: { type: "string" },
            message: { type: "string" },
          },
        },
      },
    },
    preHandler: [requireAuth],
    handler: authController.updateProfile.bind(authController),
  });

  // POST /auth/reset-password - Request password reset (public)
  app.post("/auth/reset-password", {
    schema: {
      tags: ["Auth"],
      summary: "Request password reset",
      description: "Solicita reset de senha por email",
      body: zodToJsonSchema(resetPasswordSchema),
      response: {
        200: zodToJsonSchema(resetPasswordResponseSchema),
        400: {
          type: "object",
          properties: {
            error: { type: "string" },
            message: { type: "string" },
          },
        },
      },
    },
    handler: authController.resetPassword.bind(authController),
  });

  // POST /auth/confirm-email - Confirm email with token (public)
  app.post("/auth/confirm-email", {
    schema: {
      tags: ["Auth"],
      summary: "Confirm email address",
      description: "Confirma o endereço de email com token recebido",
      body: zodToJsonSchema(confirmEmailSchema),
      response: {
        200: zodToJsonSchema(confirmEmailResponseSchema),
        400: {
          type: "object",
          properties: {
            error: { type: "string" },
            message: { type: "string" },
          },
        },
      },
    },
    handler: authController.confirmEmail.bind(authController),
  });

  // POST /auth/verify-mfa - Verify MFA code (requires auth)
  app.post("/auth/verify-mfa", {
    schema: {
      tags: ["Auth"],
      summary: "Verify MFA code",
      description: "Verifica código MFA de 8 dígitos alfanumérico",
      security: [{ bearerAuth: [] }],
      body: zodToJsonSchema(verifyMfaSchema),
      response: {
        200: zodToJsonSchema(verifyMfaResponseSchema),
        401: {
          type: "object",
          properties: {
            error: { type: "string" },
            message: { type: "string" },
          },
        },
        422: {
          type: "object",
          properties: {
            error: { type: "string" },
            message: { type: "string" },
            details: { type: "array", items: { type: "object" } },
          },
        },
      },
    },
    preHandler: [requireAuth],
    handler: authController.verifyMfa.bind(authController),
  });
}
