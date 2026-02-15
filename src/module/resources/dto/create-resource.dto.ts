import { IsNotEmpty, IsString, IsUUID } from "class-validator";

export class CreateResourceDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    description: string;

    @IsString()
    @IsNotEmpty()
    location: string;

    @IsUUID()
    @IsNotEmpty()
    createdById: string;
}
