import { z } from 'zod';

// Password validation schema
export const PasswordSchema = z
  .string()
  .min(8, 'Senha deve ter pelo menos 8 caracteres')
  .regex(/[a-z]/, 'Senha deve conter pelo menos uma letra minúscula')
  .regex(/[A-Z]/, 'Senha deve conter pelo menos uma letra maiúscula')
  .regex(/\d/, 'Senha deve conter pelo menos um número')
  .regex(/[@$!%*?&]/, 'Senha deve conter pelo menos um símbolo especial');

// Email validation schema
export const EmailSchema = z
  .string()
  .email('Email deve ter formato válido')
  .toLowerCase();

// Phone validation schema
export const PhoneSchema = z
  .string()
  .regex(/^\+?[1-9]\d{1,14}$/, 'Telefone deve ter formato válido')
  .optional();

// Login request schema
export const LoginRequestSchema = z.object({
  email: EmailSchema,
  password: z.string().min(1, 'Senha é obrigatória'),
  rememberMe: z.boolean().optional().default(false),
});

// Register request schema
export const RegisterRequestSchema = z
  .object({
    email: EmailSchema,
    password: PasswordSchema,
    confirmPassword: z.string(),
    nome: z
      .string()
      .min(2, 'Nome deve ter pelo menos 2 caracteres')
      .max(100, 'Nome deve ter no máximo 100 caracteres')
      .trim(),
    telefone: PhoneSchema,
    acceptTerms: z.boolean().refine((val) => val === true, {
      message: 'Você deve aceitar os termos de uso',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Senhas não coincidem',
    path: ['confirmPassword'],
  });

// Refresh token request schema
export const RefreshTokenRequestSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token é obrigatório'),
});

// Change password request schema
export const ChangePasswordRequestSchema = z
  .object({
    currentPassword: z.string().min(1, 'Senha atual é obrigatória'),
    newPassword: PasswordSchema,
    confirmNewPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: 'Senhas não coincidem',
    path: ['confirmNewPassword'],
  });

// Reset password request schema
export const ResetPasswordRequestSchema = z.object({
  email: EmailSchema,
});

// Reset password confirm schema
export const ResetPasswordConfirmSchema = z
  .object({
    token: z.string().min(1, 'Token é obrigatório'),
    newPassword: PasswordSchema,
    confirmNewPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: 'Senhas não coincidem',
    path: ['confirmNewPassword'],
  });

// User profile update schema
export const UpdateProfileSchema = z.object({
  nome: z
    .string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres')
    .trim()
    .optional(),
  telefone: PhoneSchema,
  avatar: z.string().url('Avatar deve ser uma URL válida').optional(),
});

// OAuth callback schema
export const OAuthCallbackSchema = z.object({
  code: z.string().min(1, 'Authorization code é obrigatório'),
  state: z.string().min(1, 'State parameter é obrigatório'),
});

// Type exports for TypeScript
export type LoginRequest = z.infer<typeof LoginRequestSchema>;
export type RegisterRequest = z.infer<typeof RegisterRequestSchema>;
export type RefreshTokenRequest = z.infer<typeof RefreshTokenRequestSchema>;
export type ChangePasswordRequest = z.infer<typeof ChangePasswordRequestSchema>;
export type ResetPasswordRequest = z.infer<typeof ResetPasswordRequestSchema>;
export type ResetPasswordConfirm = z.infer<typeof ResetPasswordConfirmSchema>;
export type UpdateProfile = z.infer<typeof UpdateProfileSchema>;
export type OAuthCallback = z.infer<typeof OAuthCallbackSchema>;

