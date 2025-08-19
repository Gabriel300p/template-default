import { FastifyInstance } from "fastify";
import { authFeature } from "./auth/auth.routes.js";
import { barbershopFeature } from "./barbershop/barbershop.routes.js";

export async function registerFeatures(app: FastifyInstance) {
  await app.register(authFeature);
  await app.register(barbershopFeature);
}
