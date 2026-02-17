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

    return next.handle().pipe(
      map((data) => {
        const baseMeta = {
          message: 'Success',
          statusCode: 200,
          timestamp: new Date().toISOString(),
          path: request.url,
          method: request.method,
        };

        if (data instanceof ReturnPaginationDto) {
          return {
            data: data.data,
            meta: {
              ...baseMeta,
              pagination: data.meta,
            },
          };
        }

        return {
          data,
          meta: baseMeta,
        };
      }),
    );
  }
}
