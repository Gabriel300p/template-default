import {
  ExternalServiceError,
  NotFoundError,
  ValidationError,
} from "../../../shared/errors/app-errors.js";
import {
  confirmEmailSupabase,
  resetPasswordSupabase,
} from "../../../shared/services/supabase-admin.service.js";
import type {
  AuthProfileResponse,
  ConfirmEmailRequest,
  ConfirmEmailResponse,
  ProfileUpdateRequest,
  ProfileUpdateResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
} from "../models/auth.models.js";
import {
  confirmEmailResponseSchema,
  confirmEmailSchema,
  profileUpdateResponseSchema,
  profileUpdateSchema,
  resetPasswordResponseSchema,
  resetPasswordSchema,
} from "../models/auth.models.js";

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
          select: { id: true, first_name: true, status: true },
        },
      },
    });

    if (!user) {
      throw new NotFoundError("User not found");
    }

    const response: AuthProfileResponse = {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        status: user.status,
        mustResetPassword: user.must_reset_password,
        firstName: user.first_name || undefined,
        lastName: user.last_name || undefined,
        displayName: user.display_name || undefined,
        phone: user.phone || undefined,
        avatarUrl: user.avatar_url || undefined,
      },
    };

    // Add role-specific data
    if (user.role === "BARBERSHOP_OWNER" && user.owned_barbershops.length > 0) {
      response.ownedBarbershops = user.owned_barbershops.map((shop: any) => ({
        id: shop.id,
        name: shop.first_name, // Using first_name as the display name
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
        first_name: validatedData.firstName,
        last_name: validatedData.lastName,
        display_name: validatedData.displayName,
        phone: validatedData.phone,
        avatar_url: validatedData.avatarUrl,
        updated_at: new Date(),
      },
      include: {
        owned_barbershops: {
          select: { id: true, first_name: true, status: true },
        },
      },
    });

    const response = {
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        role: updatedUser.role,
        status: updatedUser.status,
        mustResetPassword: updatedUser.must_reset_password,
        firstName: updatedUser.first_name || undefined,
        lastName: updatedUser.last_name || undefined,
        displayName: updatedUser.display_name || undefined,
        phone: updatedUser.phone || undefined,
        avatarUrl: updatedUser.avatar_url || undefined,
      },
      ownedBarbershops:
        updatedUser.role === "BARBERSHOP_OWNER" &&
        updatedUser.owned_barbershops.length > 0
          ? updatedUser.owned_barbershops.map((shop: any) => ({
              id: shop.id,
              name: shop.first_name,
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
}
