import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import {
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Role } from '../../../generated/prisma/enums';
import { AuthGuard } from './auth.guard';

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;

  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
    me: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    const registerDto = {
      name: 'Test',
      email: 'test@example.com',
      password: 'password',
    };

    it('should register a user', async () => {
      mockAuthService.register.mockResolvedValue({ id: '1', ...registerDto });

      const result = await controller.register(registerDto);

      expect(result).toBeDefined();
      expect(mockAuthService.register).toHaveBeenCalledWith(registerDto);
    });

    it('should throw BadRequestException', async () => {
      mockAuthService.register.mockRejectedValue(
        new BadRequestException('User exists'),
      );

      await expect(controller.register(registerDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw InternalServerErrorException for other errors', async () => {
      mockAuthService.register.mockRejectedValue(new Error('Some error'));

      await expect(controller.register(registerDto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('login', () => {
    const loginDto = { email: 'test@example.com', password: 'password' };

    it('should login a user', async () => {
      mockAuthService.login.mockResolvedValue({ token: 'token' });

      const result = await controller.login(loginDto);

      expect(result).toEqual({ token: 'token' });
    });

    it('should throw BadRequestException', async () => {
      mockAuthService.login.mockRejectedValue(
        new BadRequestException('Invalid credentials'),
      );

      await expect(controller.login(loginDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw InternalServerErrorException for other errors', async () => {
      mockAuthService.login.mockRejectedValue(new Error('Some error'));

      await expect(controller.login(loginDto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('me', () => {
    const user = { userId: '1', role: Role.USER };

    it('should return user details', async () => {
      mockAuthService.me.mockResolvedValue({
        id: '1',
        email: 'test@example.com',
      });

      const result = await controller.me({ user });

      expect(result).toEqual({ id: '1', email: 'test@example.com' });
    });

    it('should throw BadRequestException', async () => {
      mockAuthService.me.mockRejectedValue(
        new BadRequestException('User not found'),
      );

      await expect(controller.me({ user })).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw InternalServerErrorException for other errors', async () => {
      mockAuthService.me.mockRejectedValue(new Error('Some error'));

      await expect(controller.me({ user })).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });
});
