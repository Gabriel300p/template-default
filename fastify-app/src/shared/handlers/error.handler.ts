import {
  PrismaClientInitializationError,
  PrismaClientKnownRequestError,
  PrismaClientRustPanicError,
  PrismaClientUnknownRequestError,
  PrismaClientValidationError,
} from "@prisma/client/runtime/library";
import {
  FastifyError,
  FastifyInstance,
  FastifyReply,
  FastifyRequest,
} from "fastify";
import { ZodError } from "zod";

export interface ErrorResponse {
  status: number;
  error: string;
  message: string;
  code?: string;
  details?: any;
  timestamp: string;
}

/**
 * 🛡️ Global Error Handler
 * Handles all types of errors with proper HTTP status codes and user-friendly messages
 */
export function createErrorHandler(fastify: FastifyInstance) {
  return async function errorHandler(
    error: FastifyError,
    request: FastifyRequest,
    reply: FastifyReply
  ) {
    const timestamp = new Date().toISOString();

    // 🔍 Log the error for debugging
    fastify.log.error(
      {
        error: error.message,
        stack: error.stack,
        url: request.url,
        method: request.method,
        body: request.body,
        params: request.params,
        query: request.query,
      },
      "Error occurred"
    );

    // 📋 Zod Validation Errors
    if (error instanceof ZodError) {
      const errorResponse: ErrorResponse = {
        status: 400,
        error: "Validation Error",
        message: "Dados inválidos fornecidos",
        details: error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
          code: issue.code,
          ...(issue.code === "invalid_type" && "received" in issue
            ? { received: issue.received }
            : {}),
        })),
        timestamp,
      };
      return reply.status(400).send(errorResponse);
    }

    // 🗄️ Prisma Errors
    if (error instanceof PrismaClientKnownRequestError) {
      return handlePrismaKnownError(error, reply, timestamp);
    }

    if (error instanceof PrismaClientUnknownRequestError) {
      return handlePrismaUnknownError(error, reply, timestamp, fastify);
    }

    if (error instanceof PrismaClientValidationError) {
      const errorResponse: ErrorResponse = {
        status: 400,
        error: "Database Validation Error",
        message: "Erro de validação no banco de dados",
        timestamp,
      };
      return reply.status(400).send(errorResponse);
    }

    if (error instanceof PrismaClientRustPanicError) {
      const errorResponse: ErrorResponse = {
        status: 500,
        error: "Database Critical Error",
        message: "Erro crítico no banco de dados",
        timestamp,
      };
      return reply.status(500).send(errorResponse);
    }

    if (error instanceof PrismaClientInitializationError) {
      const errorResponse: ErrorResponse = {
        status: 503,
        error: "Database Connection Error",
        message: "Erro de conexão com o banco de dados",
        timestamp,
      };
      return reply.status(503).send(errorResponse);
    }

    // 🔐 Authentication Errors
    if (error.statusCode === 401) {
      const errorResponse: ErrorResponse = {
        status: 401,
        error: "Unauthorized",
        message: "Token de autenticação inválido ou expirado",
        timestamp,
      };
      return reply.status(401).send(errorResponse);
    }

    // 🚫 Forbidden Errors
    if (error.statusCode === 403) {
      const errorResponse: ErrorResponse = {
        status: 403,
        error: "Forbidden",
        message: "Acesso negado para este recurso",
        timestamp,
      };
      return reply.status(403).send(errorResponse);
    }

    // 🔍 Not Found Errors
    if (error.statusCode === 404) {
      const errorResponse: ErrorResponse = {
        status: 404,
        error: "Not Found",
        message: "Recurso não encontrado",
        timestamp,
      };
      return reply.status(404).send(errorResponse);
    }

    // ⚡ Rate Limit Errors
    if (error.statusCode === 429) {
      const errorResponse: ErrorResponse = {
        status: 429,
        error: "Too Many Requests",
        message: "Muitas tentativas. Tente novamente em alguns minutos",
        timestamp,
      };
      return reply.status(429).send(errorResponse);
    }

    // 📝 Generic Client Errors (4xx)
    if (error.statusCode && error.statusCode >= 400 && error.statusCode < 500) {
      const errorResponse: ErrorResponse = {
        status: error.statusCode,
        error: "Client Error",
        message: error.message || "Erro na requisição",
        timestamp,
      };
      return reply.status(error.statusCode).send(errorResponse);
    }

    // 💥 Generic Server Errors (5xx)
    const errorResponse: ErrorResponse = {
      status: 500,
      error: "Internal Server Error",
      message: "Erro interno do servidor. Tente novamente em alguns minutos",
      code: error.code,
      timestamp,
    };
    return reply.status(500).send(errorResponse);
  };
}

/**
 * 🗄️ Handle Prisma Known Request Errors
 */
function handlePrismaKnownError(
  error: PrismaClientKnownRequestError,
  reply: FastifyReply,
  timestamp: string
): FastifyReply {
  let errorResponse: ErrorResponse;

  switch (error.code) {
    case "P2002": // Unique constraint violation
      errorResponse = {
        status: 409,
        error: "Conflict",
        message:
          "Já existe um registro com estes dados. Verifique os dados únicos como email ou CPF",
        code: error.code,
        details: {
          target: error.meta?.target,
          modelName: error.meta?.modelName,
        },
        timestamp,
      };
      return reply.status(409).send(errorResponse);

    case "P2025": // Record not found
      errorResponse = {
        status: 404,
        error: "Not Found",
        message: "Registro não encontrado",
        code: error.code,
        timestamp,
      };
      return reply.status(404).send(errorResponse);

    case "P2003": // Foreign key constraint violation
      errorResponse = {
        status: 400,
        error: "Reference Error",
        message:
          "Erro de referência. Verifique se todos os dados relacionados existem",
        code: error.code,
        timestamp,
      };
      return reply.status(400).send(errorResponse);

    case "P2014": // Required relation violation
      errorResponse = {
        status: 400,
        error: "Relation Error",
        message: "Relação obrigatória não encontrada",
        code: error.code,
        timestamp,
      };
      return reply.status(400).send(errorResponse);

    default:
      errorResponse = {
        status: 400,
        error: "Database Error",
        message: "Erro no banco de dados",
        code: error.code,
        timestamp,
      };
      return reply.status(400).send(errorResponse);
  }
}

/**
 * 🔥 Handle Prisma Unknown Request Errors (including prepared statement issues)
 */
function handlePrismaUnknownError(
  error: PrismaClientUnknownRequestError,
  reply: FastifyReply,
  timestamp: string,
  fastify: FastifyInstance
): FastifyReply {
  const errorMessage = error.message.toLowerCase();

  // 💾 Handle prepared statement cache issues
  if (
    errorMessage.includes("prepared statement") &&
    errorMessage.includes("already exists")
  ) {
    fastify.log.warn(
      "🔄 Prepared statement cache conflict detected. Reconnecting to database..."
    );

    // Schedule a database reconnection in the background
    setTimeout(async () => {
      try {
        await fastify.prisma.$disconnect();
        await fastify.prisma.$connect();
        fastify.log.info("✅ Database reconnected successfully");
      } catch (reconnectError) {
        fastify.log.error(
          { err: reconnectError },
          "❌ Failed to reconnect to database"
        );
      }
    }, 100);

    const errorResponse: ErrorResponse = {
      status: 503,
      error: "Database Temporary Error",
      message:
        "Erro temporário no banco de dados. Tente novamente em alguns segundos",
      details: {
        type: "prepared_statement_conflict",
        recommendation: "Aguarde alguns segundos e tente novamente",
      },
      timestamp,
    };
    return reply.status(503).send(errorResponse);
  }

  // 🔌 Handle connection issues
  if (errorMessage.includes("connection") || errorMessage.includes("timeout")) {
    const errorResponse: ErrorResponse = {
      status: 503,
      error: "Database Connection Error",
      message: "Erro de conexão com o banco de dados. Tente novamente",
      timestamp,
    };
    return reply.status(503).send(errorResponse);
  }

  // 💥 Generic unknown error
  const errorResponse: ErrorResponse = {
    status: 500,
    error: "Database Unknown Error",
    message: "Erro desconhecido no banco de dados. Tente novamente",
    timestamp,
  };
  return reply.status(500).send(errorResponse);
}
