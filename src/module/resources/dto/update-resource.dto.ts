import { IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class UpdateResourceDto {
  @IsString({ message: 'Name must be a string' })
  @IsOptional()
  name?: string;

  @IsString({ message: 'Description must be a string' })
  @IsOptional()
  description?: string;

  @IsString({ message: 'Location must be a string' })
  @IsOptional()
  location?: string;

  @Min(1, { message: 'Capacity must be at least 1' })
  @IsNumber({}, { message: 'Capacity must be a number' })
  @IsOptional()
  capacity?: number;

  @Min(1000, { message: 'Price must be at least 1000' })
  @IsNumber({}, { message: 'Price must be a number' })
  @IsOptional()
  price?: number;

  @IsUUID('4', { message: 'UpdatedById must be a valid UUID' })
  @IsOptional()
  updatedById?: string;
}
