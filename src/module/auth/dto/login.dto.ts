import { IsEmail, IsString } from "class-validator";

export class LoginDto {
    @IsEmail(undefined, {message: "Email must be a valid email address"})
    email: string;

    @IsString({message: "Password must be a string"})
    password: string;
}