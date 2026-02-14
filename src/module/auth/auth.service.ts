import {
  BadRequestException,
  Injectable,
  Logger,
  OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { hash, verify } from '../../utils/hash';
import { ConfigService } from '@nestjs/config';
import { Role } from 'generated/prisma/enums';
import { JwtService } from '@nestjs/jwt';
import { JwtClaims } from './interface/auth.interface';

@Injectable()
export class AuthService implements OnModuleInit {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  async onModuleInit() {
    const adminEmail = this.configService.get<string>('ADMIN_EMAIL');
    const adminPassword = this.configService.get<string>('ADMIN_PASSWORD');
    const findExistingUser = await this.prisma.user.findUnique({
      where: {
        email: adminEmail,
      },
    });

    if (!findExistingUser) {
      if (!adminEmail || !adminPassword) {
        throw new Error(
          'ADMIN_EMAIL or ADMIN_PASSWORD not found in environment variables',
        );
      }
      const hashedPassword = await hash(adminPassword);
      await this.prisma.user.create({
        data: {
          name: 'admin',
          email: adminEmail,
          password: hashedPassword,
          role: Role.ADMIN,
        },
      });
      Logger.log('Admin user created successfully');
      return;
    }

    Logger.log('Admin user already exists');
  }

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

      const payload: JwtClaims = {
        userId: findUser.id,
        role: findUser.role,
      };

      const token = this.jwtService.sign<JwtClaims>(payload);

      return {
        token,
      };
    } catch (error) {
      throw error;
    }
  }

  async me(userId: string) {
    try {
      const findUser = await this.prisma.user.findUnique({
        where: {
          id: userId,
        },
      });

      if (!findUser) {
        throw new UnauthorizedException('User not found');
      }

      return findUser;
    } catch (error) {
      throw error;
    }
  }
}
