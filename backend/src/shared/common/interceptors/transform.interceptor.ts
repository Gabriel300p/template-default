import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Request } from 'express';

export interface Response<T> {
  data: T;
  meta?: {
    timestamp: string;
    requestId: string;
    version: string;
  };
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, Response<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const requestId = (request as any).requestId;

    return next.handle().pipe(
      map((data) => {
        // Don't transform if data is already in the expected format
        if (data && typeof data === 'object' && 'data' in data) {
          return data;
        }

        // Don't transform health check responses
        if (data && typeof data === 'object' && 'status' in data && 'uptime' in data) {
          return data;
        }

        // Don't transform error responses
        if (data && typeof data === 'object' && 'error' in data && 'statusCode' in data) {
          return data;
        }

        // Don't transform simple message responses
        if (data && typeof data === 'object' && 'message' in data && Object.keys(data).length === 1) {
          return {
            ...data,
            timestamp: new Date().toISOString(),
            requestId,
          };
        }

        // Transform regular responses
        return {
          data,
          meta: {
            timestamp: new Date().toISOString(),
            requestId,
            version: '1.0.0',
          },
        };
      }),
    );
  }
}

