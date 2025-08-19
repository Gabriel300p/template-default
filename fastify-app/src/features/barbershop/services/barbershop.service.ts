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

// Interface for Prisma Client (avoiding direct import issues)
interface PrismaClientLike {
  user: {
    findFirst: (args: any) => Promise<any>;
    create: (args: any) => Promise<any>;
  };
  barbershop: {
    create: (args: any) => Promise<any>;
    findUnique: (args: any) => Promise<any>;
  };
  $transaction: <T>(fn: (tx: any) => Promise<T>) => Promise<T>;
}

export class BarbershopService {
  constructor(private prisma: PrismaClientLike) {}

  async createBarbershopWithOwner(
    request: BarbershopCreateRequest
  ): Promise<BarbershopCreateResponse> {
    // Validate input using Zod
    const validatedRequest = barbershopCreateSchema.parse(request);

    // Check existing email
    const existing = await this.prisma.user.findFirst({
      where: { email: validatedRequest.owner.email },
    });
    if (existing) throw new ConflictError("Email already in use");

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
            mustResetPassword: !validatedRequest.owner.password,
          },
        });

        const shop = await tx.barbershop.create({
          data: {
            name: validatedRequest.barbershop.name,
            description: validatedRequest.barbershop.description,
            phone: validatedRequest.barbershop.phone,
            website: validatedRequest.barbershop.website,
            links: [],
            ownerUserId: user.id,
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

      throw new InternalError("Barbershop creation failed");
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
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!barbershop) throw new NotFoundError("Barbershop not found");

    // Check access permissions
    if (
      barbershop.ownerUserId !== validatedUserId &&
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
      status: barbershop.status,
      owner: barbershop.owner,
      createdAt: barbershop.createdAt.toISOString(),
      updatedAt: barbershop.updatedAt.toISOString(),
    };

    // Validate response using Zod
    return barbershopDetailsResponseSchema.parse(response);
  }
}
