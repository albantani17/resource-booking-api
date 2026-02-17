import {
  BadRequestException,
  Body,
  Controller,
  Get,
  InternalServerErrorException,
  Post,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtClaims } from './interface/auth.interface';
import { AuthGuard } from './auth.guard';
import { SerializeInterceptor } from 'src/common/interceptor/serialize.interceptor';
import { UserDto } from './dto/user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @UseInterceptors(new SerializeInterceptor(UserDto))
  async register(@Body() registerDto: RegisterDto) {
    try {
      return await this.authService.register(registerDto);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to register user', error);
    }
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    try {
      return await this.authService.login(loginDto);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to login user', error);
    }
  }

  @Get('me')
  @UseInterceptors(new SerializeInterceptor(UserDto))
  @UseGuards(AuthGuard)
  async me(@Req() req: { user: JwtClaims }) {
    try {
      return await this.authService.me(req.user.userId);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to get user', error);
    }
  }
}
