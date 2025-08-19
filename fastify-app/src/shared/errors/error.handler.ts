import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import fp from "fastify-plugin";
import { ZodError } from "zod";
import { AppError } from "./app-errors.js";

export default fp(async (app: FastifyInstance) => {
  app.setErrorHandler(
    async (error: Error, request: FastifyRequest, reply: FastifyReply) => {
      request.log.error({ err: error }, "Request error");

      if (error instanceof AppError) {
        return reply.code(error.statusCode).send(error.toJSON());
      }

      if (error instanceof ZodError) {
        return reply.code(422).send({
          error: "VALIDATION_ERROR",
          message: "Invalid request data",
          details: error.issues,
        });
      }

      // Fastify validation errors
      if ("validation" in error && error.validation) {
        return reply.code(422).send({
          error: "VALIDATION_ERROR",
          message: "Invalid request data",
          details: error.validation,
        });
      }

      // Default to 500
      return reply.code(500).send({
        error: "INTERNAL_ERROR",
        message: "An unexpected error occurred",
      });
    }
  );
});
