import { IsDateString, IsNotEmpty, IsUUID, Min } from 'class-validator';

export class CreateBookingDto {
  @IsUUID(undefined, { message: 'Invalid resource ID' })
  @IsNotEmpty()
  resourceId: string;

  @IsDateString({}, { message: 'Invalid start time' })
  @IsNotEmpty()
  startTime: string;

  @IsDateString({}, { message: 'Invalid end time' })
  @IsNotEmpty()
  endTime: string;

  @Min(1, { message: 'Slots must be at least 1' })
  @IsNotEmpty()
  slots: number;
}
