import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const requestId = uuidv4();

    let status: number;
    let message: string;
    let error: string;
    let details: any;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      
      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const responseObj = exceptionResponse as any;
        message = responseObj.message || exception.message;
        error = responseObj.error || exception.name;
        details = responseObj.details;
      } else {
        message = exceptionResponse as string;
        error = exception.name;
      }
    } else if (exception instanceof Error) {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Erro interno do servidor';
      error = exception.name;
      
      // Log the full error for debugging
      this.logger.error(
        `Unhandled exception: ${exception.message}`,
        exception.stack,
        {
          requestId,
          url: request.url,
          method: request.method,
          ip: request.ip,
          userAgent: request.get('User-Agent'),
        },
      );
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Erro interno do servidor';
      error = 'UnknownError';
      
      this.logger.error(
        `Unknown exception type: ${typeof exception}`,
        JSON.stringify(exception),
        {
          requestId,
          url: request.url,
          method: request.method,
        },
      );
    }

    const errorResponse = {
      error,
      message,
      statusCode: status,
      timestamp: new Date().toISOString(),
      requestId,
      path: request.url,
      ...(details && { details }),
    };

    // Log error for monitoring
    if (status >= 500) {
      this.logger.error(
        `HTTP ${status} Error`,
        JSON.stringify(errorResponse),
      );
    } else if (status >= 400) {
      this.logger.warn(
        `HTTP ${status} Error`,
        JSON.stringify(errorResponse),
      );
    }

    response.status(status).json(errorResponse);
  }
}

