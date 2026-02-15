import { Test, TestingModule } from '@nestjs/testing';
import { ResourcesService } from './resources.service';
import { PrismaService } from '../../prisma/prisma.service';
import { BadRequestException } from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client';

describe('ResourcesService', () => {
  let service: ResourcesService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    resource: {
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ResourcesService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<ResourcesService>(ResourcesService);
    prismaService = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createResourceDto: any = {
      name: 'Resource 1',
      description: 'Desc',
      location: 'Loc',
      imageUrl: 'url',
      createdBy_id: '1',
    };

    it('should create a resource', async () => {
      mockPrismaService.resource.create.mockResolvedValue({
        id: '1',
        ...createResourceDto,
      });

      const result = await service.create(createResourceDto);

      expect(result).toBeDefined();
      expect(mockPrismaService.resource.create).toHaveBeenCalled();
    });

    it('should throw BadRequestException if resource already exists', async () => {
      const error = new PrismaClientKnownRequestError('Error', {
        code: 'P2002',
        clientVersion: '1',
      });
      mockPrismaService.resource.create.mockRejectedValue(error);

      await expect(service.create(createResourceDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if resource not found (P2025)', async () => {
      const error = new PrismaClientKnownRequestError('Error', {
        code: 'P2025',
        clientVersion: '1',
      });
      mockPrismaService.resource.create.mockRejectedValue(error);

      await expect(service.create(createResourceDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException for invalid resource ID', async () => {
      const error = new PrismaClientKnownRequestError('Error', {
        code: 'P2003',
        clientVersion: '1',
      });
      mockPrismaService.resource.create.mockRejectedValue(error);

      await expect(service.create(createResourceDto)).rejects.toThrow(
        'Invalid resource ID',
      );
    });

    it('should rethrow other errors', async () => {
      mockPrismaService.resource.create.mockRejectedValue(
        new Error('DB Error'),
      );
      await expect(service.create(createResourceDto)).rejects.toThrow(
        'DB Error',
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated resources', async () => {
      mockPrismaService.resource.findMany.mockResolvedValue([
        { id: '1', name: 'Res 1' },
      ]);
      mockPrismaService.resource.count.mockResolvedValue(1);

      const result = await service.findAll(10, 0, '');

      expect(result).toEqual({
        resources: [{ id: '1', name: 'Res 1' }],
        total: 1,
      });
      expect(mockPrismaService.resource.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 0, take: 10 }),
      );
    });

    it('should handle search', async () => {
      mockPrismaService.resource.findMany.mockResolvedValue([]);
      mockPrismaService.resource.count.mockResolvedValue(0);

      await service.findAll(10, 0, 'test');

      expect(mockPrismaService.resource.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              expect.objectContaining({ name: expect.anything() }),
            ]),
          }),
        }),
      );
    });

    it('should throw BadRequestException for Prisma error', async () => {
      const error = new PrismaClientKnownRequestError('Error', {
        code: 'P2000',
        clientVersion: '1',
      });
      mockPrismaService.resource.findMany.mockRejectedValue(error);

      await expect(service.findAll(10, 0, '')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should rethrow other errors', async () => {
      mockPrismaService.resource.findMany.mockRejectedValue(
        new Error('DB Error'),
      );
      await expect(service.findAll(10, 0, '')).rejects.toThrow('DB Error');
    });
  });

  describe('findOne', () => {
    it('should return a resource', async () => {
      mockPrismaService.resource.findUnique.mockResolvedValue({ id: '1' });

      const result = await service.findOne('1');

      expect(result).toEqual({ id: '1' });
    });

    it('should throw BadRequestException if not found', async () => {
      mockPrismaService.resource.findUnique.mockResolvedValue(null);

      await expect(service.findOne('1')).rejects.toThrow('Resource not found');
    });

    it('should throw BadRequestException for Prisma error', async () => {
      const error = new PrismaClientKnownRequestError('Error', {
        code: 'P2000',
        clientVersion: '1',
      });
      mockPrismaService.resource.findUnique.mockRejectedValue(error);

      await expect(service.findOne('1')).rejects.toThrow(BadRequestException);
    });

    it('should rethrow other errors', async () => {
      mockPrismaService.resource.findUnique.mockRejectedValue(
        new Error('DB Error'),
      );
      await expect(service.findOne('1')).rejects.toThrow('DB Error');
    });
  });

  describe('update', () => {
    const updateDto = { name: 'Updated' };

    it('should update a resource', async () => {
      mockPrismaService.resource.findUnique.mockResolvedValue({ id: '1' });
      mockPrismaService.resource.update.mockResolvedValue({
        id: '1',
        ...updateDto,
      });

      const result = await service.update('1', updateDto);

      expect(result).toEqual({ id: '1', ...updateDto });
    });

    it('should throw BadRequestException if resource not found', async () => {
      mockPrismaService.resource.findUnique.mockResolvedValue(null);

      await expect(service.update('1', updateDto)).rejects.toThrow(
        'Resource not found',
      );
    });

    it('should throw BadRequestException for Prisma error during update', async () => {
      mockPrismaService.resource.findUnique.mockResolvedValue({ id: '1' });
      const error = new PrismaClientKnownRequestError('Error', {
        code: 'P2000',
        clientVersion: '1',
      });
      mockPrismaService.resource.update.mockRejectedValue(error);

      await expect(service.update('1', updateDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should rethrow other errors', async () => {
      mockPrismaService.resource.findUnique.mockResolvedValue({ id: '1' });
      mockPrismaService.resource.update.mockRejectedValue(
        new Error('DB Error'),
      );
      await expect(service.update('1', updateDto)).rejects.toThrow('DB Error');
    });
  });

  describe('remove', () => {
    it('should remove a resource', async () => {
      mockPrismaService.resource.findUnique.mockResolvedValue({ id: '1' });
      mockPrismaService.resource.delete.mockResolvedValue({ id: '1' });

      const result = await service.remove('1');

      expect(result).toEqual({ id: '1' });
    });

    it('should throw BadRequestException if resource not found', async () => {
      mockPrismaService.resource.findUnique.mockResolvedValue(null);

      await expect(service.remove('1')).rejects.toThrow('Resource not found');
    });

    it('should throw BadRequestException for Prisma error during delete', async () => {
      mockPrismaService.resource.findUnique.mockResolvedValue({ id: '1' });
      const error = new PrismaClientKnownRequestError('Error', {
        code: 'P2000',
        clientVersion: '1',
      });
      mockPrismaService.resource.delete.mockRejectedValue(error);

      await expect(service.remove('1')).rejects.toThrow(BadRequestException);
    });

    it('should rethrow other errors', async () => {
      mockPrismaService.resource.findUnique.mockResolvedValue({ id: '1' });
      mockPrismaService.resource.delete.mockRejectedValue(
        new Error('DB Error'),
      );
      await expect(service.remove('1')).rejects.toThrow('DB Error');
    });
  });
});
