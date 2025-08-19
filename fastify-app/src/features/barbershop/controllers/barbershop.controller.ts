import { FastifyReply, FastifyRequest } from "fastify";
import { barbershopCreateSchema } from "../models/barbershop.models.js";
import { BarbershopService } from "../services/barbershop.service.js";

export class BarbershopController {
  constructor(private barbershopService: BarbershopService) {}

  async createBarbershop(request: FastifyRequest, reply: FastifyReply) {
    const validated = barbershopCreateSchema.parse(request.body);
    const result = await this.barbershopService.createBarbershopWithOwner(
      validated
    );
    return reply.code(201).send(result);
  }

  async getBarbershop(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const { currentUser } = request as any; // From supabase auth plugin

    const result = await this.barbershopService.getBarbershopById(
      id,
      currentUser.id,
      currentUser.role
    );
    return reply.code(200).send(result);
  }
}
