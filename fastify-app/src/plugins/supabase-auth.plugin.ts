import type { FastifyRequest } from "fastify";
import fp from "fastify-plugin";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

declare module "fastify" {
  interface FastifyRequest {
    currentUser?: { id: string; role: string; status: string };
  }
}

export default fp(async (app) => {
  app.decorateRequest("currentUser", null as any);

  app.addHook("preHandler", async (req) => {
    const auth = req.headers.authorization;
    console.log("🔑 Supabase Plugin Debug:");
    console.log("  - Auth header:", auth ? "Present" : "Missing");

    if (!auth || !auth.startsWith("Bearer ")) {
      console.log("  - No Bearer token found");
      return;
    }

    const token = auth.substring(7);
    console.log("  - Token extracted:", token.substring(0, 50) + "...");

    let decoded: any;
    try {
      decoded = jwt.verify(token, env.SUPABASE_JWT_SECRET);
      console.log("  - Token verified successfully");
      console.log("  - User ID from token:", decoded.sub);
    } catch (error: any) {
      console.log("  - Token verification failed:", error.message);
      return; // ignore invalid for public routes
    }
    const userId = decoded.sub as string;
    if (!userId) return;
    // Upsert profile lightweight
    const existing = await (req.server.prisma as any).user.findUnique({
      where: { id: userId },
    });
    if (!existing) {
      await (req.server.prisma as any).user.create({
        data: {
          id: userId,
          email:
            decoded.email ||
            decoded.user_metadata?.email ||
            `unknown_${userId}@example.com`,
          role: "PENDING",
        },
      });
      req.currentUser = { id: userId, role: "PENDING", status: "ACTIVE" };
    } else {
      req.currentUser = {
        id: existing.id,
        role: existing.role,
        status: existing.status,
      };
    }
  });
});
