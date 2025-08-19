import Fastify from "fastify";
import { registerFeatures } from "./features/index.js";
import prismaPlugin from "./plugins/prisma.plugin.js";
import supabaseAuth from "./plugins/supabase-auth.plugin.js";
import errorHandler from "./shared/errors/error.handler.js";
import passwordResetMiddleware from "./shared/middleware/password-reset.middleware.js";

export async function buildApp() {
  const app = Fastify({ logger: true });
  await app.register(prismaPlugin);
  await app.register(supabaseAuth);
  await app.register(errorHandler);
  await app.register(passwordResetMiddleware);

  app.get("/health", () => ({ status: "ok" }));

  await registerFeatures(app);

  return app;
}
