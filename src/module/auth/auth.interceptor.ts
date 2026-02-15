import {
  CallHandler,
  ExecutionContext,
  NestInterceptor,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { JwtClaims } from './interface/auth.interface';

export class AuthInterceptor implements NestInterceptor {
  constructor(private readonly role: string) {}
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const user = request.user as JwtClaims;

    if (user.role !== this.role) {
      throw new UnauthorizedException('Unauthorized');
    }

    return next.handle();
  }
}
