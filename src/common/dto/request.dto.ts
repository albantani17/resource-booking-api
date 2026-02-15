import { IsNumber, IsOptional, IsString } from "class-validator";

export class RequestPaginationDto {
    @IsNumber()
    @IsOptional()
    limit: number = 10;

    @IsNumber()
    @IsOptional()
    page: number = 1;

    @IsString()
    @IsOptional()
    search: string = '';
}