import { PrismaClient, UserRole } from "@prisma/client";
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
import { PrismaSafeOperations } from "../../../shared/utils/prisma-safe.utils.js";
import { UniqueDataValidator } from "../../../shared/utils/unique-data-validator.utils.js";
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

export class AuthService {
  constructor(
    private prisma: PrismaClient,
    private prismaSafe: PrismaSafeOperations,
    private uniqueValidator: UniqueDataValidator
  ) {}

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

    // Check if MFA is required (first login or 14+ days since last verification)
    const mfaRequired = await this.checkMfaRequired(user);

    if (mfaRequired) {
      // Generate and send MFA code for first access
      await this.generateMfaCode(user.id);

      throw new UnauthorizedError("MFA verification required");
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

    // Validate unique data constraints only if values are being changed
    if (validatedData.phone && validatedData.phone !== existingUser.phone) {
      await this.uniqueValidator.validateUniquePhone(
        validatedData.phone,
        userId
      );
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

  // Check if MFA is required (first login or 14+ days since last verification)
  private async checkMfaRequired(user: any): Promise<boolean> {
    if (!user.mfa_enabled) return false;

    // First login case
    if (!user.mfa_last_verified) return true;

    // Check if 14+ days have passed since last verification
    const daysSinceLastMfa = Math.floor(
      (new Date().getTime() - user.mfa_last_verified.getTime()) /
        (1000 * 60 * 60 * 24)
    );

    return daysSinceLastMfa >= 14;
  }

  // Generate and send MFA code
  private async generateMfaCode(userId: string): Promise<void> {
    // Generate 8-digit alphanumeric code
    const code = Math.random().toString(36).substring(2, 10).toUpperCase();
    const expiryMinutes = 10;

    // Clean up any existing unused MFA sessions for this user
    await this.prisma.mfaSession.deleteMany({
      where: {
        user_id: userId,
        used_at: null,
      },
    });

    // Create new MFA session
    await this.prisma.mfaSession.create({
      data: {
        user_id: userId,
        code,
        expires_at: new Date(Date.now() + expiryMinutes * 60 * 1000),
        code_expiry_minutes: expiryMinutes,
        session_duration_days: 14,
      },
    });

    // Get user email for sending
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    });

    if (user) {
      // Send MFA code via email (using email as userName for now)
      await emailService.sendMfaCode(user.email, user.email, code);
    }
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

    // Validate unique data constraints
    await this.uniqueValidator.validateUserUniqueFields({
      email: validatedData.email,
      cpf: validatedData.cpf,
      phone: validatedData.phone,
      passport: validatedData.passport,
    });

    try {
      // Create user in Supabase Auth
      const supabaseUser = await createSupabaseUser({
        email: validatedData.email,
        password: validatedData.password,
      });

      // Determine role based on context
      let role: UserRole;
      switch (validatedData.registrationContext) {
        case "barbershop_owner":
          role = UserRole.BARBERSHOP_OWNER;
          break;
        case "staff":
          role = UserRole.BARBER; // Staff são barbeiros
          break;
        default:
          role = UserRole.PENDING; // Usuários comuns são clientes
      }

      // Create user profile in our database
      // First, try to find if user already exists (might be created by trigger)
      const existingUser = await this.prisma.user.findUnique({
        where: { id: supabaseUser.id },
      });

      if (existingUser) {
        // User already exists (created by trigger), just update
        await this.prismaSafe.update("user", {
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
      } else {
        // User doesn't exist, create new one
        await this.prismaSafe.create("user", {
          data: {
            id: supabaseUser.id,
            email: supabaseUser.email,
            cpf: validatedData.cpf || null,
            passport: validatedData.passport || null,
            is_foreigner: validatedData.isforeigner,
            phone: validatedData.phone,
            role,
            must_reset_password: false,
          },
        });
      }

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

      // Check if MFA is enabled - new architecture uses MfaSession table
      if (user.mfa_enabled) {
        // Generate and send MFA code
        await this.generateMfaCode(user.id);

        const response = {
          mfaRequired: true,
          message: "Código MFA enviado para seu email",
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
      // Find active MFA session for this code
      const mfaSession = await this.prisma.mfaSession.findFirst({
        where: {
          code: validatedData.code,
          used_at: null, // Not used yet
          expires_at: {
            gte: new Date(), // Not expired
          },
        },
        include: {
          user: {
            include: {
              owned_barbershops: {
                select: { name: true },
                take: 1,
              },
            },
          },
        },
      });

      if (!mfaSession) {
        throw new UnauthorizedError("Código MFA inválido ou expirado");
      }

      const user = mfaSession.user;

      // Mark MFA session as used and update user
      await this.prisma.$transaction(async (tx) => {
        // Mark session as used
        await tx.mfaSession.update({
          where: { id: mfaSession.id },
          data: {
            used_at: new Date(),
          },
        });

        // Update user's last MFA verification and login
        await tx.user.update({
          where: { id: user.id },
          data: {
            mfa_last_verified: new Date(),
            last_login: new Date(),
            must_reset_password: false, // ✅ Clear password reset requirement after MFA
          },
        });

        // Clean up expired and used MFA sessions for this user
        await tx.mfaSession.deleteMany({
          where: {
            user_id: user.id,
            OR: [
              { used_at: { not: null } }, // Used sessions
              { expires_at: { lt: new Date() } }, // Expired sessions
            ],
          },
        });
      });

      // Get display name from barbershop if available
      let displayName: string | undefined;
      if (user.owned_barbershops && user.owned_barbershops.length > 0) {
        displayName = user.owned_barbershops[0].name;
      }

      const response = {
        success: true,
        message: "MFA verificado com sucesso",
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          displayName,
          mfaVerified: true,
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
