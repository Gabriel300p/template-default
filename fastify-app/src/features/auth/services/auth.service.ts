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
        ownedBarbershops: {
          select: { id: true, name: true, status: true },
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
        mustResetPassword: user.mustResetPassword,
        firstName: user.firstName || undefined,
        lastName: user.lastName || undefined,
        displayName: user.displayName || undefined,
        phone: user.phone || undefined,
        avatarUrl: user.avatarUrl || undefined,
      },
    };

    // Add role-specific data
    if (user.role === "BARBERSHOP_OWNER" && user.ownedBarbershops.length > 0) {
      response.ownedBarbershops = user.ownedBarbershops;
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
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        displayName: validatedData.displayName,
        phone: validatedData.phone,
        avatarUrl: validatedData.avatarUrl,
        updatedAt: new Date(),
      },
      include: {
        ownedBarbershops: {
          select: { id: true, name: true, status: true },
        },
      },
    });

    const response = {
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        role: updatedUser.role,
        status: updatedUser.status,
        mustResetPassword: updatedUser.mustResetPassword,
        firstName: updatedUser.firstName || undefined,
        lastName: updatedUser.lastName || undefined,
        displayName: updatedUser.displayName || undefined,
        phone: updatedUser.phone || undefined,
        avatarUrl: updatedUser.avatarUrl || undefined,
      },
      ownedBarbershops:
        updatedUser.role === "BARBERSHOP_OWNER" &&
        updatedUser.ownedBarbershops.length > 0
          ? updatedUser.ownedBarbershops
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
