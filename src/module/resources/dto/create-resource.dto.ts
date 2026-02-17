import { IsNotEmpty, IsNumber, IsString, IsUUID, Min } from 'class-validator';

export class CreateResourceDto {
  @IsString({ message: 'Name must be a string' })
  @IsNotEmpty({ message: 'Name is required' })
  name: string;

  @IsString({ message: 'Description must be a string' })
  @IsNotEmpty({ message: 'Description is required' })
  description: string;

  @IsString({ message: 'Location must be a string' })
  @IsNotEmpty({ message: 'Location is required' })
  location: string;

  @Min(1, { message: 'Capacity must be at least 1' })
  @IsNumber({}, { message: 'Capacity must be a number' })
  capacity: number;

  @Min(1000, { message: 'Price must be at least 1000' })
  @IsNumber({}, { message: 'Price must be a number' })
  price: number;

  @IsUUID('4', { message: 'CreatedById must be a valid UUID' })
  createdById: string;
}
