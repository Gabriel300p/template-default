import { z } from "zod";

// Zod schemas for auth operations
export const profileUpdateSchema = z
  .object({
    firstName: z.string().min(1).max(50).optional(),
    lastName: z.string().min(1).max(50).optional(),
    displayName: z.string().min(1).max(100).optional(),
    phone: z
      .string()
      .regex(/^\+?[1-9]\d{1,14}$/)
      .optional(), // E.164 format
    avatarUrl: z.string().url().optional(),
  })
  .strict(); // Prevent extra fields

export const resetPasswordSchema = z
  .object({
    email: z.string().email(),
  })
  .strict();

export const confirmEmailSchema = z
  .object({
    token: z.string().min(1),
    email: z.string().email(),
  })
  .strict();

export const profileUpdateResponseSchema = z.object({
  user: z.object({
    id: z.string(),
    email: z.string(),
    role: z.string(),
    status: z.string(),
    mustResetPassword: z.boolean(),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    displayName: z.string().optional(),
    phone: z.string().optional(),
    avatarUrl: z.string().optional(),
  }),
  ownedBarbershops: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        status: z.string(),
      })
    )
    .optional(),
});

export const resetPasswordResponseSchema = z.object({
  message: z.string(),
  success: z.boolean(),
});

export const confirmEmailResponseSchema = z.object({
  message: z.string(),
  success: z.boolean(),
});

// Types inferred from Zod schemas
export type ProfileUpdateRequest = z.infer<typeof profileUpdateSchema>;
export type ProfileUpdateResponse = z.infer<typeof profileUpdateResponseSchema>;
export type ResetPasswordRequest = z.infer<typeof resetPasswordSchema>;
export type ResetPasswordResponse = z.infer<typeof resetPasswordResponseSchema>;
export type ConfirmEmailRequest = z.infer<typeof confirmEmailSchema>;
export type ConfirmEmailResponse = z.infer<typeof confirmEmailResponseSchema>;

// Legacy interfaces (keeping for backward compatibility)
export interface UserProfile {
  id: string;
  email: string;
  role: string;
  status: string;
  mustResetPassword: boolean;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  phone?: string;
  avatarUrl?: string;
}

export interface BarbershopSummary {
  id: string;
  name: string;
  status: string;
}

export interface AuthProfileResponse {
  user: UserProfile;
  ownedBarbershops?: BarbershopSummary[];
  // Future: staffMemberships, clientAppointments, etc based on role
}
