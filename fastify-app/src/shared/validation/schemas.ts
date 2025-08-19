import { z } from "zod";

// Common schemas
export const emailSchema = z.string().email();
export const passwordSchema = z.string().min(8);
export const phoneSchema = z.string().optional();
export const urlSchema = z.string().url().optional();

// Onboarding schemas
export const ownerSchema = z.object({
  email: emailSchema,
  password: passwordSchema.optional(),
});

export const barbershopSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  phone: phoneSchema,
  website: urlSchema,
});

export const onboardingBodySchema = z.object({
  owner: ownerSchema,
  barbershop: barbershopSchema,
});

// Staff schemas
export const staffUserSchema = z.object({
  email: emailSchema,
  password: passwordSchema.optional(),
});

export const staffBodySchema = z.object({
  barbershopId: z.string(),
  user: staffUserSchema,
  status: z.enum(["ACTIVE", "INACTIVE", "SUSPENDED", "TERMINATED"]).optional(),
});

export type OnboardingBody = z.infer<typeof onboardingBodySchema>;
export type StaffBody = z.infer<typeof staffBodySchema>;
