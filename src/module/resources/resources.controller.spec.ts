import { Test, TestingModule } from '@nestjs/testing';
import { ResourcesController } from './resources.controller';
import { ResourcesService } from './resources.service';
import { ReturnPaginationDto } from '../../common/dto/response.dto';
import { BadRequestException } from '@nestjs/common';
import { Role } from '../../../generated/prisma/enums';
// Mock AuthInterceptor
jest.mock('../../common/interceptor/response.interceptor', () => ({
  SerializeInterceptor: jest.fn().mockImplementation(() => ({
    intercept: jest.fn().mockImplementation((context, next) => next.handle()),
  })),
}));

describe('ResourcesController', () => {
  let controller: ResourcesController;
  let service: ResourcesService;

  const mockResourcesService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ResourcesController],
      providers: [
        {
          provide: ResourcesService,
          useValue: mockResourcesService,
        },
      ],
    })
      .overrideGuard(require('../auth/auth.guard').AuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<ResourcesController>(ResourcesController);
    service = module.get<ResourcesService>(ResourcesService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    const createDto: any = { name: 'New Resource' };

    it('should create a resource', async () => {
      mockResourcesService.create.mockResolvedValue({ id: '1', ...createDto });

      const result = await controller.create(createDto);

      expect(result).toEqual({ id: '1', ...createDto });
      expect(mockResourcesService.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('findAll', () => {
    it('should return paginated resources', async () => {
      const query = { page: 1, limit: 10, search: 'test' };
      const serviceResult = {
        resources: [{ id: '1', name: 'Res 1' }],
        total: 1,
      };
      mockResourcesService.findAll.mockResolvedValue(serviceResult);

      const result = await controller.findAll(query as any);

      expect(result).toBeInstanceOf(ReturnPaginationDto);
      expect(result.data).toEqual(serviceResult.resources);
      expect(result.meta.total).toBe(1);
      expect(mockResourcesService.findAll).toHaveBeenCalledWith(10, 0, 'test');
    });
  });

  describe('findOne', () => {
    it('should return a resource', async () => {
      mockResourcesService.findOne.mockResolvedValue({ id: '1' });

      const result = await controller.findOne('1');

      expect(result).toEqual({ id: '1' });
    });
  });

  describe('update', () => {
    const updateDto = { name: 'Updated' };

    it('should update a resource', async () => {
      mockResourcesService.update.mockResolvedValue({ id: '1', ...updateDto });

      const result = await controller.update('1', updateDto);

      expect(result).toEqual({ id: '1', ...updateDto });
    });
  });

  describe('remove', () => {
    it('should remove a resource', async () => {
      mockResourcesService.remove.mockResolvedValue({ id: '1' });

      const result = await controller.remove('1');

      expect(result).toEqual({ id: '1' });
    });
  });
});
