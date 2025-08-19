import { FastifyInstance } from "fastify";
import { UnauthorizedError } from "../../shared/errors/app-errors.js";
import { BarbershopController } from "./controllers/barbershop.controller.js";
import { BarbershopService } from "./services/barbershop.service.js";

// Auth middleware using currentUser from supabase plugin
async function requireAuth(request: any, reply: any) {
  if (!request.currentUser) {
    throw new UnauthorizedError("Authentication required");
  }
}

export async function barbershopFeature(app: FastifyInstance) {
  const barbershopService = new BarbershopService(app.prisma);
  const barbershopController = new BarbershopController(barbershopService);

  // POST /barbershop - Create barbershop with owner
  app.post("/barbershop", {
    handler: barbershopController.createBarbershop.bind(barbershopController),
  });

  // GET /barbershop/:id - Get barbershop details (requires auth)
  app.get("/barbershop/:id", {
    preHandler: [requireAuth],
    handler: barbershopController.getBarbershop.bind(barbershopController),
  });
}
