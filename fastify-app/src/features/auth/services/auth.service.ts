import {
  ExternalServiceError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from "../../../shared/errors/app-errors.js";
import { emailService } from "../../../shared/services/email.service.js";
import {
  confirmEmailSupabase,
  createSupabaseUser,
  resetPasswordSupabase,
} from "../../../shared/services/supabase-admin.service.js";
import type {
  AuthProfileResponse,
  ConfirmEmailRequest,
  ConfirmEmailResponse,
  LoginRequest,
  LoginResponse,
  ProfileUpdateRequest,
  ProfileUpdateResponse,
  RegisterRequest,
  RegisterResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
  VerifyMfaRequest,
  VerifyMfaResponse,
} from "../models/auth.models.js";
import {
  confirmEmailResponseSchema,
  confirmEmailSchema,
  loginResponseSchema,
  loginSchema,
  profileUpdateResponseSchema,
  profileUpdateSchema,
  registerResponseSchema,
  registerSchema,
  resetPasswordResponseSchema,
  resetPasswordSchema,
  verifyMfaResponseSchema,
  verifyMfaSchema,
} from "../models/auth.models.js";
import { mfaService } from "./mfa.service.js";

// Interface for Prisma Client (avoiding direct import issues)
interface PrismaClientLike {
  user: {
    findUnique: (args: any) => Promise<any>;
    update: (args: any) => Promise<any>;
  };
}

export class AuthService {
  constructor(private prisma: PrismaClientLike) {}

  async getProfile(userId: string): Promise<AuthProfileResponse> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        owned_barbershops: {
          select: { id: true, name: true, status: true },
        },
      },
    });

    if (!user) {
      throw new NotFoundError("User not found");
    }

    // Get display name from barbershop or staff
    let displayName: string | undefined;
    if (user.owned_barbershops && user.owned_barbershops.length > 0) {
      // Use barbershop name as display name
      displayName = user.owned_barbershops[0].name;
    }
    // TODO: Add staff lookup for display name

    const response: AuthProfileResponse = {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        status: user.status,
        mustResetPassword: user.must_reset_password,
        displayName,
        phone: user.phone || undefined,
        avatarUrl: user.avatar_url || undefined,
        cpf: user.cpf || undefined,
        passport: user.passport || undefined,
        isforeigner: user.is_foreigner,
      },
    };

    // Add owned barbershops if any
    if (user.owned_barbershops && user.owned_barbershops.length > 0) {
      response.ownedBarbershops = user.owned_barbershops.map((shop: any) => ({
        id: shop.id,
        name: shop.name,
        status: shop.status,
      }));
    }

    return response;
  }

  async updateProfile(
    userId: string,
    updateData: ProfileUpdateRequest
  ): Promise<ProfileUpdateResponse> {
    // Validate input using Zod
    const validatedData = profileUpdateSchema.parse(updateData);

    // Check if user exists
    const existingUser = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      throw new NotFoundError("User not found");
    }

    // Update user profile
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        display_name: validatedData.displayName,
        phone: validatedData.phone,
        avatar_url: validatedData.avatarUrl,
        updated_at: new Date(),
      },
      include: {
        owned_barbershops: {
          select: { id: true, name: true, status: true },
        },
      },
    });

    // Get display name from barbershop or staff
    let displayName = validatedData.displayName || undefined;
    if (
      !displayName &&
      updatedUser.owned_barbershops &&
      updatedUser.owned_barbershops.length > 0
    ) {
      displayName = updatedUser.owned_barbershops[0].name;
    }

    const response = {
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        role: updatedUser.role,
        status: updatedUser.status,
        mustResetPassword: updatedUser.must_reset_password,
        displayName,
        phone: updatedUser.phone || undefined,
        avatarUrl: updatedUser.avatar_url || undefined,
        cpf: updatedUser.cpf || undefined,
        passport: updatedUser.passport || undefined,
        isforeigner: updatedUser.is_foreigner,
      },
      ownedBarbershops:
        updatedUser.role === "BARBERSHOP_OWNER" &&
        updatedUser.owned_barbershops.length > 0
          ? updatedUser.owned_barbershops.map((shop: any) => ({
              id: shop.id,
              name: shop.name,
              status: shop.status,
            }))
          : undefined,
    };

    // Validate response using Zod
    return profileUpdateResponseSchema.parse(response);
  }

  async resetPassword(
    resetData: ResetPasswordRequest
  ): Promise<ResetPasswordResponse> {
    // Validate input using Zod
    const validatedData = resetPasswordSchema.parse(resetData);

    try {
      // Call Supabase admin API for password reset
      await resetPasswordSupabase(validatedData.email);

      const response = {
        message: "Password reset email sent successfully",
        success: true,
      };

      // Validate response using Zod
      return resetPasswordResponseSchema.parse(response);
    } catch (error: any) {
      throw new ExternalServiceError(
        "Failed to send password reset email",
        error.message
      );
    }
  }

  async confirmEmail(
    confirmData: ConfirmEmailRequest
  ): Promise<ConfirmEmailResponse> {
    // Validate input using Zod
    const validatedData = confirmEmailSchema.parse(confirmData);

    try {
      // Call Supabase admin API for email confirmation
      await confirmEmailSupabase(validatedData.token, validatedData.email);

      const response = {
        message: "Email confirmed successfully",
        success: true,
      };

      // Validate response using Zod
      return confirmEmailResponseSchema.parse(response);
    } catch (error: any) {
      throw new ExternalServiceError("Failed to confirm email", error.message);
    }
  }

  // ===== B-BOSS SPECIFIC METHODS =====

  async register(registerData: RegisterRequest): Promise<RegisterResponse> {
    // Validate input using Zod
    const validatedData = registerSchema.parse(registerData);

    try {
      // Create user in Supabase Auth
      const supabaseUser = await createSupabaseUser({
        email: validatedData.email,
        password: validatedData.password,
      });

      // Determine role based on context
      let role: string;
      switch (validatedData.registrationContext) {
        case "barbershop_owner":
          role = "BARBERSHOP_OWNER";
          break;
        case "staff":
          role = "STAFF";
          break;
        default:
          role = "USER";
      }

      // Create user profile in our database
      await this.prisma.user.update({
        where: { id: supabaseUser.id },
        data: {
          cpf: validatedData.cpf || null,
          passport: validatedData.passport || null,
          is_foreigner: validatedData.isforeigner,
          phone: validatedData.phone,
          role,
          must_reset_password: false,
        },
      });

      const response = {
        message: "Cadastro realizado com sucesso.",
        success: true,
        userId: supabaseUser.id,
      };

      return registerResponseSchema.parse(response);
    } catch (error: any) {
      if (
        error.message.includes("already exists") ||
        error.message.includes("duplicate")
      ) {
        throw new ValidationError("Email ou CPF já cadastrado no sistema");
      }
      throw new ExternalServiceError("Erro ao criar usuário", error.message);
    }
  }

  async login(loginData: LoginRequest): Promise<LoginResponse> {
    // Validate input using Zod
    const validatedData = loginSchema.parse(loginData);

    try {
      // Find user by email or CPF
      let user;
      if (validatedData.credential.includes("@")) {
        // Login by email
        user = await this.prisma.user.findUnique({
          where: { email: validatedData.credential },
          include: {
            owned_barbershops: {
              select: { name: true },
              take: 1,
            },
          },
        });
      } else {
        // Login by CPF
        user = await this.prisma.user.findUnique({
          where: { cpf: validatedData.credential },
          include: {
            owned_barbershops: {
              select: { name: true },
              take: 1,
            },
          },
        });
      }

      if (!user) {
        throw new UnauthorizedError("Credenciais inválidas");
      }

      // Get display name from barbershop if available
      let displayName: string | undefined;
      if (user.owned_barbershops && user.owned_barbershops.length > 0) {
        displayName = user.owned_barbershops[0].name;
      }

      // TODO: Verify password with Supabase Auth
      // For now, assume password is valid

      // Check if MFA is enabled
      if (user.mfa_enabled) {
        // Generate and send MFA code
        const mfaData = mfaService.generateMfaCode();

        // Save MFA code to database
        await this.prisma.user.update({
          where: { id: user.id },
          data: {
            mfa_code: mfaData.code,
            mfa_expires: mfaData.expires,
          },
        });

        // Send MFA email using Supabase emails
        await emailService.sendMfaCode(
          user.email,
          displayName || "Usuário",
          mfaData.code
        );

        // Generate temporary token
        const tempToken = mfaService.generateTempToken(user.id);

        const response = {
          mfaRequired: true,
          tempToken,
        };

        return loginResponseSchema.parse(response);
      } else {
        // No MFA required - return JWT token directly
        // TODO: Generate actual JWT token with Supabase
        const response = {
          mfaRequired: false,
          token: "jwt_token_here",
          user: {
            id: user.id,
            email: user.email,
            role: user.role,
            displayName,
          },
        };

        return loginResponseSchema.parse(response);
      }
    } catch (error: any) {
      if (error instanceof UnauthorizedError) {
        throw error;
      }
      throw new ExternalServiceError("Erro no login", error.message);
    }
  }

  async verifyMfa(mfaData: VerifyMfaRequest): Promise<VerifyMfaResponse> {
    // Validate input using Zod
    const validatedData = verifyMfaSchema.parse(mfaData);

    try {
      // Verify temporary token
      const tokenData = mfaService.verifyTempToken(validatedData.tempToken);
      if (!tokenData) {
        throw new UnauthorizedError("Token temporário inválido ou expirado");
      }

      // Find user and verify MFA code
      const user = await this.prisma.user.findUnique({
        where: { id: tokenData.userId },
        include: {
          owned_barbershops: {
            select: { name: true },
            take: 1,
          },
        },
      });

      if (!user) {
        throw new NotFoundError("Usuário não encontrado");
      }

      // Check MFA code and expiration
      if (
        !user.mfa_code ||
        user.mfa_code !== validatedData.mfaCode ||
        !user.mfa_expires ||
        user.mfa_expires < new Date()
      ) {
        throw new UnauthorizedError("Código MFA inválido ou expirado");
      }

      // Clear MFA code
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          mfa_code: null,
          mfa_expires: null,
          last_login: new Date(),
        },
      });

      // Get display name from barbershop if available
      let displayName: string | undefined;
      if (user.owned_barbershops && user.owned_barbershops.length > 0) {
        displayName = user.owned_barbershops[0].name;
      }

      // TODO: Generate actual JWT token with Supabase
      const response = {
        success: true,
        token: "jwt_token_here",
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          displayName,
        },
      };

      return verifyMfaResponseSchema.parse(response);
    } catch (error: any) {
      if (
        error instanceof UnauthorizedError ||
        error instanceof NotFoundError
      ) {
        throw error;
      }
      throw new ExternalServiceError("Erro na verificação MFA", error.message);
    }
  }
}
