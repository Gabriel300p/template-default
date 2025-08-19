import { FastifyReply, FastifyRequest } from "fastify";
import { UnauthorizedError } from "../../../shared/errors/app-errors.js";
import {
  confirmEmailSchema,
  profileUpdateSchema,
  resetPasswordSchema,
  verifyMfaSchema,
} from "../models/auth.models.js";
import { AuthService } from "../services/auth.service.js";

export class AuthController {
  constructor(private authService: AuthService) {}

  async getProfile(request: FastifyRequest, reply: FastifyReply) {
    if (!request.currentUser)
      throw new UnauthorizedError("Authentication required");

    const profile = await this.authService.getProfile(request.currentUser.id);
    return reply.send(profile);
  }

  async updateProfile(request: FastifyRequest, reply: FastifyReply) {
    if (!request.currentUser)
      throw new UnauthorizedError("Authentication required");

    const validatedData = profileUpdateSchema.parse(request.body);
    const updatedProfile = await this.authService.updateProfile(
      request.currentUser.id,
      validatedData
    );

    return reply.send(updatedProfile);
  }

  async resetPassword(request: FastifyRequest, reply: FastifyReply) {
    const validatedData = resetPasswordSchema.parse(request.body);
    const result = await this.authService.resetPassword(validatedData);

    return reply.send(result);
  }

  async confirmEmail(request: FastifyRequest, reply: FastifyReply) {
    const validatedData = confirmEmailSchema.parse(request.body);
    const result = await this.authService.confirmEmail(validatedData);

    return reply.send(result);
  }

  async verifyMfa(request: FastifyRequest, reply: FastifyReply) {
    if (!request.currentUser)
      throw new UnauthorizedError("Authentication required");

    const validatedData = verifyMfaSchema.parse(request.body);
    const result = await this.authService.verifyMfa(validatedData);

    return reply.send(result);
  }
}
