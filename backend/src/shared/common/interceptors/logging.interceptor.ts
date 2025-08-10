import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();
    
    const requestId = uuidv4();
    const startTime = Date.now();
    
    // Add requestId to request for use in other parts of the application
    (request as any).requestId = requestId;
    
    // Add requestId to response headers
    response.setHeader('X-Request-ID', requestId);

    const { method, url, ip } = request;
    const userAgent = request.get('User-Agent') || '';
    
    // Log incoming request
    this.logger.log(
      `Incoming Request: ${method} ${url}`,
      {
        requestId,
        method,
        url,
        ip,
        userAgent,
        timestamp: new Date().toISOString(),
      },
    );

    return next.handle().pipe(
      tap({
        next: (data) => {
          const responseTime = Date.now() - startTime;
          const { statusCode } = response;
          
          // Log successful response
          this.logger.log(
            `Outgoing Response: ${method} ${url} ${statusCode} - ${responseTime}ms`,
            {
              requestId,
              method,
              url,
              statusCode,
              responseTime,
              ip,
              userAgent,
              timestamp: new Date().toISOString(),
            },
          );
        },
        error: (error) => {
          const responseTime = Date.now() - startTime;
          const statusCode = error.status || 500;
          
          // Log error response
          this.logger.error(
            `Error Response: ${method} ${url} ${statusCode} - ${responseTime}ms`,
            {
              requestId,
              method,
              url,
              statusCode,
              responseTime,
              ip,
              userAgent,
              error: error.message,
              stack: error.stack,
              timestamp: new Date().toISOString(),
            },
          );
        },
      }),
    );
  }
}

