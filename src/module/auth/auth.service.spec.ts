import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import {
  BadRequestException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import * as hashUtils from '../../utils/hash';
import { Role } from '../../../generated/prisma/enums';

jest.mock('../../utils/hash');

describe('AuthService', () => {
  let service: AuthService;
  let prismaService: PrismaService;
  let configService: ConfigService;
  let jwtService: JwtService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prismaService = module.get<PrismaService>(PrismaService);
    configService = module.get<ConfigService>(ConfigService);
    jwtService = module.get<JwtService>(JwtService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('onModuleInit', () => {
    it('should create admin user if not exists', async () => {
      mockConfigService.get
        .mockReturnValueOnce('admin@example.com')
        .mockReturnValueOnce('password');
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      (hashUtils.hash as jest.Mock).mockResolvedValue('hashedPassword');
      mockPrismaService.user.create.mockResolvedValue({
        id: '1',
        email: 'admin@example.com',
      });
      jest.spyOn(Logger, 'log').mockImplementation();

      await service.onModuleInit();

      expect(mockPrismaService.user.create).toHaveBeenCalledWith({
        data: {
          name: 'admin',
          email: 'admin@example.com',
          password: 'hashedPassword',
          role: Role.ADMIN,
        },
      });
    });

    it('should log if admin user already exists', async () => {
      mockConfigService.get.mockReturnValue('admin@example.com');
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: '1',
        email: 'admin@example.com',
      });
      const loggerSpy = jest.spyOn(Logger, 'log').mockImplementation();

      await service.onModuleInit();

      expect(mockPrismaService.user.create).not.toHaveBeenCalled();
      expect(loggerSpy).toHaveBeenCalledWith('Admin user already exists');
    });

    it('should throw error if env vars are missing', async () => {
      mockConfigService.get.mockReturnValue(undefined);
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.onModuleInit()).rejects.toThrow(
        'ADMIN_EMAIL or ADMIN_PASSWORD not found in environment variables',
      );
    });
  });

  describe('register', () => {
    const registerDto = {
      name: 'Test',
      email: 'test@example.com',
      password: 'password',
    };

    it('should register a new user successfully', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      (hashUtils.hash as jest.Mock).mockResolvedValue('hashedPassword');
      mockPrismaService.user.create.mockResolvedValue({
        ...registerDto,
        id: '1',
        password: 'hashedPassword',
      });

      const result = await service.register(registerDto);

      expect(result).toBeDefined();
      expect(mockPrismaService.user.create).toHaveBeenCalled();
    });

    it('should throw BadRequestException if user already exists', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({ id: '1' });

      await expect(service.register(registerDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should rethrow other errors', async () => {
      mockPrismaService.user.findUnique.mockRejectedValue(
        new Error('DB Error'),
      );
      await expect(service.register(registerDto)).rejects.toThrow('DB Error');
    });
  });

  describe('login', () => {
    const loginDto = { email: 'test@example.com', password: 'password' };

    it('should return token for valid credentials', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: '1',
        email: 'test@example.com',
        password: 'hashedPassword',
        role: Role.USER,
      });
      (hashUtils.verify as jest.Mock).mockResolvedValue(true);
      mockJwtService.sign.mockReturnValue('token');

      const result = await service.login(loginDto);

      expect(result).toEqual({ token: 'token' });
    });

    it('should throw BadRequestException for user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException for invalid password', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: '1',
        password: 'hashedPassword',
      });
      (hashUtils.verify as jest.Mock).mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should rethrow other errors', async () => {
      mockPrismaService.user.findUnique.mockRejectedValue(
        new Error('DB Error'),
      );
      await expect(service.login(loginDto)).rejects.toThrow('DB Error');
    });
  });

  describe('me', () => {
    it('should return user details', async () => {
      const user = { id: '1', email: 'test@example.com' };
      mockPrismaService.user.findUnique.mockResolvedValue(user);

      const result = await service.me('1');

      expect(result).toEqual(user);
    });

    it('should throw UnauthorizedException if user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.me('1')).rejects.toThrow(UnauthorizedException);
    });

    it('should rethrow other errors', async () => {
      mockPrismaService.user.findUnique.mockRejectedValue(
        new Error('DB Error'),
      );
      await expect(service.me('1')).rejects.toThrow('DB Error');
    });
  });
});
