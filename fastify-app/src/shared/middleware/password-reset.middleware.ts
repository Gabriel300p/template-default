import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import fp from "fastify-plugin";
import { PasswordResetRequiredError } from "../errors/app-errors.js";

// Routes that should bypass password reset check
const BYPASS_ROUTES = new Set([
  "/health",
  "/me",
  "/onboarding/barbershop",
  // Add password reset route when implemented: '/auth/reset-password'
]);

export default fp(async (app: FastifyInstance) => {
  app.addHook(
    "preHandler",
    async (request: FastifyRequest, reply: FastifyReply) => {
      // Skip if no current user (public routes)
      if (!request.currentUser) return;

      // Skip bypass routes
      if (BYPASS_ROUTES.has(request.url.split("?")[0])) return;

      // Check if password reset is required
      const prisma = request.server.prisma as any;
      const user = await prisma.user.findUnique({
        where: { id: request.currentUser.id },
        select: { mustResetPassword: true },
      });

      if (user?.mustResetPassword) {
        throw new PasswordResetRequiredError(
          "Password reset required before accessing this resource"
        );
      }
    }
  );
});
