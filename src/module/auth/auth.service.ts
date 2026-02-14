import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { hash, verify } from '../../utils/hash';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async register(registerDto: RegisterDto) {
    const { name, email, password } = registerDto;

    try {
      const findExistingUser = await this.prisma.user.findUnique({
        where: {
          email,
        },
      });

      if (findExistingUser) {
        throw new BadRequestException('User already exists');
      }

      const hashedPassword = await hash(password);

      const user = await this.prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
        },
      });

      return user;
    } catch (error) {
      throw error;
    }
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    try {
      const findUser = await this.prisma.user.findUnique({
        where: {
          email,
        },
      });

      if (!findUser) {
        throw new BadRequestException('User not found');
      }

      const isPasswordValid = await verify(findUser.password, password);

      if (!isPasswordValid) {
        throw new BadRequestException('Invalid password');
      }

      return findUser;
    } catch (error) {
      throw error;
    }
  }
}
