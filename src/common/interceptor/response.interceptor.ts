import {
  CallHandler,
  ExecutionContext,
  HttpException,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { catchError, map, throwError } from 'rxjs';
import { ReturnPaginationDto } from '../dto/response.dto';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler) {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const statusCode = response.statusCode;

    return next.handle().pipe(
      map((data) => {
        if (data instanceof ReturnPaginationDto) {
          return {
            message: response.message,
            data,
            meta: {
              statusCode,
              error: statusCode >= 400 ? response.message : null,
              timestamp: new Date().toISOString(),
              path: request.url,
              method: request.method,
            },
          };
        }
        return {
          message: response.message,
          data,
          meta: {
            statusCode,
            error: statusCode >= 400 ? response.message : null,
            timestamp: new Date().toISOString(),
            path: request.url,
            method: request.method,
          },
        };
      }),
      catchError((error) => {
        const statusCode =
          error instanceof HttpException ? error.getStatus() : 500;
        const errorResponse = {
          message:
            error instanceof HttpException
              ? error.message
              : 'Internal Server Error',
          data: null,
          meta: {
            statusCode,
            error: statusCode >= 400 ? error.message : null,
            timestamp: new Date().toISOString(),
            path: request.url,
            method: request.method,
          },
        };
        return throwError(() => new HttpException(errorResponse, statusCode));
      }),
    );
  }
}
