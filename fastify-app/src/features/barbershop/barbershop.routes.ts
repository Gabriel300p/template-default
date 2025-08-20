import { FastifyInstance } from "fastify";
import { UnauthorizedError } from "../../shared/errors/app-errors.js";
import { zodToJsonSchema } from "../../shared/utils/swagger.utils.js";
import { BarbershopController } from "./controllers/barbershop.controller.js";
import {
  barbershopCreateResponseSchema,
  barbershopCreateSchema,
  barbershopDetailsResponseSchema,
} from "./models/barbershop.models.js";
import { BarbershopService } from "./services/barbershop.service.js";

// Auth middleware using currentUser from supabase plugin
async function requireAuth(request: any, reply: any) {
  if (!request.currentUser) {
    throw new UnauthorizedError("Authentication required");
  }
}

export async function barbershopFeature(app: FastifyInstance) {
  const barbershopService = new BarbershopService(
    app.prisma,
    app.prismaSafe,
    app.uniqueValidator
  );
  const barbershopController = new BarbershopController(barbershopService);

  // POST /barbershop - Create barbershop with owner
  app.post("/barbershop", {
    schema: {
      tags: ["Barbershop"],
      summary: "Create new barbershop",
      description:
        "Cria uma nova barbearia com proprietário. Se a senha não for fornecida, uma será gerada automaticamente.",
      body: zodToJsonSchema(barbershopCreateSchema),
      response: {
        201: zodToJsonSchema(barbershopCreateResponseSchema),
        400: {
          type: "object",
          properties: {
            error: { type: "string" },
            message: { type: "string" },
          },
        },
        409: {
          type: "object",
          properties: {
            error: { type: "string" },
            message: { type: "string" },
          },
        },
      },
    },
    handler: barbershopController.createBarbershop.bind(barbershopController),
  });

  // GET /barbershop/:id - Get barbershop details (requires auth)
  app.get("/barbershop/:id", {
    schema: {
      tags: ["Barbershop"],
      summary: "Get barbershop details",
      description:
        "Retorna detalhes de uma barbearia específica (requer autenticação)",
      security: [{ bearerAuth: [] }],
      params: {
        type: "object",
        properties: {
          id: {
            type: "string",
            description: "ID da barbearia",
          },
        },
        required: ["id"],
      },
      response: {
        200: zodToJsonSchema(barbershopDetailsResponseSchema),
        401: {
          type: "object",
          properties: {
            error: { type: "string" },
            message: { type: "string" },
          },
        },
        403: {
          type: "object",
          properties: {
            error: { type: "string" },
            message: { type: "string" },
          },
        },
        404: {
          type: "object",
          properties: {
            error: { type: "string" },
            message: { type: "string" },
          },
        },
      },
    },
    preHandler: [requireAuth],
    handler: barbershopController.getBarbershop.bind(barbershopController),
  });
}
