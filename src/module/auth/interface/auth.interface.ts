import { Role } from 'generated/prisma/enums';

export interface JwtClaims {
  userId: string;
  role: Role;
}
