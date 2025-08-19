import { z } from "zod";

// Validation schemas for barbershop creation and management
export const ownerInputSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).optional(),
  cpf: z.string().optional(),
  phone: z.string().optional(),
  isforeigner: z.boolean().optional(),
});

export const barbershopInputSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  phone: z.string().optional(),
  website: z.string().url().optional(),
  logo_url: z.string().url().optional(),
  cover_url: z.string().url().optional(),
  appointment_link: z.string().url().optional(),
});

export const barbershopCreateSchema = z.object({
  owner: ownerInputSchema,
  barbershop: barbershopInputSchema,
});

// Response schemas using Zod
export const barbershopCreateResponseSchema = z.object({
  barbershopId: z.string(),
  ownerUserId: z.string(),
  generatedPassword: z.string().optional(),
});

export const barbershopDetailsResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  phone: z.string().optional(),
  website: z.string().optional(),
  logo_url: z.string().optional(),
  cover_url: z.string().optional(),
  appointment_link: z.string().optional(),
  status: z.string(),
  owner: z.object({
    id: z.string(),
    email: z.string(),
  }),
  created_at: z.string(),
  updated_at: z.string(),
});

// Types inferred from Zod schemas
export type BarbershopCreateRequest = z.infer<typeof barbershopCreateSchema>;
export type OwnerInput = z.infer<typeof ownerInputSchema>;
export type BarbershopInput = z.infer<typeof barbershopInputSchema>;
export type BarbershopCreateResponse = z.infer<
  typeof barbershopCreateResponseSchema
>;
export type BarbershopDetailsResponse = z.infer<
  typeof barbershopDetailsResponseSchema
>;
