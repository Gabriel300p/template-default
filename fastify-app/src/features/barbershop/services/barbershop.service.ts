import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import {
  ConflictError,
  ExternalServiceError,
  InternalError,
  NotFoundError,
} from "../../../shared/errors/app-errors.js";
import {
  createSupabaseUser,
  deleteSupabaseUser,
} from "../../../shared/services/supabase-admin.service.js";
import { generatePassword } from "../../../shared/utils/password.util.js";
import {
  barbershopCreateResponseSchema,
  barbershopCreateSchema,
  barbershopDetailsResponseSchema,
  type BarbershopCreateRequest,
  type BarbershopCreateResponse,
  type BarbershopDetailsResponse,
} from "../models/barbershop.models.js";

export class BarbershopService {
  constructor(private prisma: PrismaClient) {}

  async createBarbershopWithOwner(
    request: BarbershopCreateRequest
  ): Promise<BarbershopCreateResponse> {
    // Validate input using Zod
    const validatedRequest = barbershopCreateSchema.parse(request);

    // Check if email is already registered
    const existingUser = await this.prisma.user.findUnique({
      where: { email: validatedRequest.owner.email },
    });

    if (existingUser) {
      throw new Error(
        `Email ${validatedRequest.owner.email} is already registered`
      );
    }

    const password = validatedRequest.owner.password || generatePassword(12);
    let createdAuth: { id: string; email: string } | null = null;

    try {
      createdAuth = await createSupabaseUser({
        email: validatedRequest.owner.email,
        password,
      });
    } catch (e: any) {
      throw new ExternalServiceError(
        "Failed to create authentication user",
        e.message
      );
    }

    try {
      const result = await this.prisma.$transaction(async (tx: any) => {
        const user = await tx.user.create({
          data: {
            id: createdAuth!.id,
            email: createdAuth!.email,
            role: "BARBERSHOP_OWNER",
            must_reset_password: !validatedRequest.owner.password,
            cpf: validatedRequest.owner.cpf,
            phone: validatedRequest.owner.phone,
            is_foreigner: validatedRequest.owner.isforeigner || false,
          },
        });

        const shop = await tx.barbershop.create({
          data: {
            name: validatedRequest.barbershop.name,
            description: validatedRequest.barbershop.description,
            phone: validatedRequest.barbershop.phone,
            website: validatedRequest.barbershop.website,
            logo_url: validatedRequest.barbershop.logo_url,
            cover_url: validatedRequest.barbershop.cover_url,
            appointment_link: validatedRequest.barbershop.appointment_link,
            links: [],
            owner_user_id: user.id,
          },
        });

        return { user, shop };
      });

      const response = {
        barbershopId: result.shop.id,
        ownerUserId: result.user.id,
        generatedPassword: validatedRequest.owner.password
          ? undefined
          : password,
      };

      // Validate response using Zod
      return barbershopCreateResponseSchema.parse(response);
    } catch (e: any) {
      // Cleanup: delete auth user if created
      try {
        if (createdAuth) await deleteSupabaseUser(createdAuth.id);
      } catch {}

      console.error("Barbershop creation error details:", e);
      throw new InternalError(`Barbershop creation failed: ${e.message}`);
    }
  }

  async getBarbershopById(
    id: string,
    currentUserId: string,
    currentUserRole: string
  ): Promise<BarbershopDetailsResponse> {
    // Validate inputs
    const idSchema = z.string().uuid();
    const userIdSchema = z.string().uuid();
    const roleSchema = z.string();

    const validatedId = idSchema.parse(id);
    const validatedUserId = userIdSchema.parse(currentUserId);
    const validatedRole = roleSchema.parse(currentUserRole);

    const barbershop = await this.prisma.barbershop.findUnique({
      where: { id: validatedId },
      include: {
        owner: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });

    if (!barbershop) throw new NotFoundError("Barbershop not found");

    // Check access permissions
    if (
      barbershop.owner_user_id !== validatedUserId &&
      validatedRole !== "SUPER_ADMIN"
    ) {
      throw new NotFoundError("Barbershop not found"); // Don't reveal existence
    }

    const response = {
      id: barbershop.id,
      name: barbershop.name,
      description: barbershop.description,
      phone: barbershop.phone,
      website: barbershop.website,
      logo_url: barbershop.logo_url,
      cover_url: barbershop.cover_url,
      appointment_link: barbershop.appointment_link,
      status: barbershop.status,
      owner: barbershop.owner,
      created_at: barbershop.created_at.toISOString(),
      updated_at: barbershop.updated_at.toISOString(),
    };

    // Validate response using Zod
    return barbershopDetailsResponseSchema.parse(response);
  }
}
