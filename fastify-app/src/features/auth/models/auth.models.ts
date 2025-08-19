import { z } from "zod";
import {
  cpfSchema,
  credentialSchema,
  emailSchema,
  fullNameSchema,
  mfaCodeSchema,
  passportSchema,
  phoneSchema,
  strongPasswordSchema,
} from "../../../shared/schemas/validation.schemas.js";

// B-BOSS Registration schema (basic auth data only)
export const registerSchema = z
  .object({
    cpf: cpfSchema.optional(),
    passport: passportSchema.optional(),
    isforeigner: z.boolean().default(false),
    email: emailSchema,
    phone: phoneSchema,
    password: strongPasswordSchema,
    confirmPassword: z.string(),
    // Context para definir role
    registrationContext: z
      .enum(["barbershop_owner", "staff", "user"])
      .default("user"),
  })
  .strict()
  .refine((data) => data.password === data.confirmPassword, {
    message: "Senhas não coincidem",
    path: ["confirmPassword"],
  })
  .refine(
    (data) => {
      if (data.isforeigner) {
        return !!data.passport && !data.cpf;
      } else {
        return !!data.cpf && !data.passport;
      }
    },
    {
      message:
        "Estrangeiros devem fornecer passaporte. Brasileiros devem fornecer CPF.",
      path: ["cpf", "passport"],
    }
  );

// B-BOSS Login schema
export const loginSchema = z
  .object({
    credential: credentialSchema, // email or CPF
    password: z.string().min(1),
  })
  .strict();

// MFA verification schema
export const verifyMfaSchema = z
  .object({
    tempToken: z.string().min(1),
    mfaCode: mfaCodeSchema,
  })
  .strict();
// Response schemas
export const registerResponseSchema = z.object({
  message: z.string(),
  success: z.boolean(),
  userId: z.string(),
});

export const loginResponseSchema = z.object({
  mfaRequired: z.boolean(),
  tempToken: z.string().optional(), // if MFA required
  token: z.string().optional(), // if MFA not required
  user: z
    .object({
      id: z.string(),
      email: z.string(),
      role: z.string(),
      // Nome vem do barbershop/staff, não do user
      displayName: z.string().optional(),
    })
    .optional(),
});

export const verifyMfaResponseSchema = z.object({
  success: z.boolean(),
  token: z.string(),
  user: z.object({
    id: z.string(),
    email: z.string(),
    role: z.string(),
    displayName: z.string().optional(),
  }),
});

export const profileUpdateSchema = z
  .object({
    displayName: z.string().min(1).max(100).optional(),
    phone: phoneSchema.optional(),
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
    displayName: z.string().optional(),
    phone: z.string().optional(),
    avatarUrl: z.string().optional(),
    cpf: z.string().optional(),
    passport: z.string().optional(),
    isforeigner: z.boolean(),
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
export type RegisterRequest = z.infer<typeof registerSchema>;
export type RegisterResponse = z.infer<typeof registerResponseSchema>;
export type LoginRequest = z.infer<typeof loginSchema>;
export type LoginResponse = z.infer<typeof loginResponseSchema>;
export type VerifyMfaRequest = z.infer<typeof verifyMfaSchema>;
export type VerifyMfaResponse = z.infer<typeof verifyMfaResponseSchema>;
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
  displayName?: string;
  phone?: string;
  avatarUrl?: string;
  cpf?: string;
  passport?: string;
  isforeigner: boolean;
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
