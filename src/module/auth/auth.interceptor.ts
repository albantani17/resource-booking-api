import {
  CallHandler,
  ExecutionContext,
  NestInterceptor,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { JwtClaims } from './interface/auth.interface';
import { Role } from 'generated/prisma/enums';

export class AuthInterceptor implements NestInterceptor {
  constructor(private readonly role: Role[]) {}
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const user = request.user as JwtClaims;

    if (!this.role.includes(user.role)) {
      throw new UnauthorizedException('Unauthorized');
    }

    return next.handle();
  }
}
