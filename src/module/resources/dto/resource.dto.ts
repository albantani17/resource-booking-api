import { Expose, Type } from 'class-transformer';
import { Resource } from 'generated/prisma/browser';
import { UserDto } from 'src/module/auth/dto/user.dto';

export class ResourceDto implements Resource {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  description: string;

  @Expose()
  location: string;

  @Expose()
  capacity: number;

  @Expose()
  price: number;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  @Expose()
  createdById: string;

  @Type(() => UserDto)
  createdBy: UserDto;
}
