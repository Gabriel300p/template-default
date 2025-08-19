import { FastifyInstance } from "fastify";
import { UnauthorizedError } from "../../shared/errors/app-errors.js";
import { AuthController } from "./controllers/auth.controller.js";
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
    preHandler: [requireAuth],
    handler: authController.getProfile.bind(authController),
  });

  // PATCH /auth/profile - Update user profile (requires auth)
  app.patch("/auth/profile", {
    preHandler: [requireAuth],
    handler: authController.updateProfile.bind(authController),
  });

  // POST /auth/reset-password - Request password reset (public)
  app.post("/auth/reset-password", {
    handler: authController.resetPassword.bind(authController),
  });

  // POST /auth/confirm-email - Confirm email with token (public)
  app.post("/auth/confirm-email", {
    handler: authController.confirmEmail.bind(authController),
  });
}
