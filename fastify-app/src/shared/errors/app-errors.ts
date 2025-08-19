export abstract class AppError extends Error {
  abstract readonly statusCode: number;
  abstract readonly code: string;

  constructor(message: string, public readonly details?: any) {
    super(message);
    this.name = this.constructor.name;
  }

  toJSON() {
    return {
      error: this.code,
      message: this.message,
      ...(this.details && { details: this.details }),
    };
  }
}

export class ValidationError extends AppError {
  readonly statusCode = 422;
  readonly code = "VALIDATION_ERROR";
}

export class NotFoundError extends AppError {
  readonly statusCode = 404;
  readonly code = "NOT_FOUND";
}

export class ConflictError extends AppError {
  readonly statusCode = 409;
  readonly code = "CONFLICT";
}

export class UnauthorizedError extends AppError {
  readonly statusCode = 401;
  readonly code = "UNAUTHORIZED";
}

export class ForbiddenError extends AppError {
  readonly statusCode = 403;
  readonly code = "FORBIDDEN";
}

export class PasswordResetRequiredError extends AppError {
  readonly statusCode = 423;
  readonly code = "PASSWORD_RESET_REQUIRED";
}

export class ExternalServiceError extends AppError {
  readonly statusCode = 502;
  readonly code = "EXTERNAL_SERVICE_ERROR";
}

export class InternalError extends AppError {
  readonly statusCode = 500;
  readonly code = "INTERNAL_ERROR";
}
