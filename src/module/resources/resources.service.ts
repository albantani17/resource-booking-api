import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateResourceDto } from './dto/create-resource.dto';
import { UpdateResourceDto } from './dto/update-resource.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client';
import { Resource } from 'generated/prisma/browser';

@Injectable()
export class ResourcesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createResourceDto: CreateResourceDto): Promise<Resource> {
    try {
      const resource = await this.prisma.resource.create({
        data: createResourceDto,
        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });
      return resource;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new BadRequestException(
            'Resource already exists',
            error.message,
          );
        }
        if (error.code === 'P2025') {
          throw new BadRequestException('Resource not found', error.message);
        }
        throw new BadRequestException('Invalid resource ID', error.message);
      }
      throw error;
    }
  }

  async findAll(
    limit: number,
    offset: number,
    search: string,
  ): Promise<{
    resources: Resource[];
    total: number;
  }> {
    try {
      const resources = await this.prisma.resource.findMany({
        take: limit,
        skip: offset,
        where: {
          OR: [
            {
              name: {
                mode: 'insensitive',
                contains: search,
              },
            },
            {
              description: {
                mode: 'insensitive',
                contains: search,
              },
            },
            {
              location: {
                mode: 'insensitive',
                contains: search,
              },
            },
          ],
        },
        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      const total = await this.prisma.resource.count({
        take: limit,
        skip: offset,
      });

      return {
        resources,
        total,
      };
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        throw new BadRequestException('Invalid resource ID');
      }
      throw error;
    }
  }

  async findOne(id: string): Promise<Resource> {
    try {
      const resource = await this.prisma.resource.findUnique({
        where: {
          id,
        },
        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      if (!resource) {
        throw new BadRequestException('Resource not found');
      }

      return resource;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        throw new BadRequestException('Invalid resource ID', error.message);
      }
      throw error;
    }
  }

  async update(
    id: string,
    updateResourceDto: UpdateResourceDto,
  ): Promise<Resource> {
    try {
      const resource = await this.prisma.resource.findUnique({
        where: {
          id,
        },
      });

      if (!resource) {
        throw new BadRequestException('Resource not found');
      }

      const updatedResource = await this.prisma.resource.update({
        where: {
          id,
        },
        data: updateResourceDto,
        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });
      return updatedResource;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        throw new BadRequestException('Invalid resource ID', error.message);
      }
      throw error;
    }
  }

  async remove(id: string): Promise<Resource> {
    try {
      const resource = await this.prisma.resource.findUnique({
        where: {
          id,
        },
      });

      if (!resource) {
        throw new BadRequestException('Resource not found');
      }

      const deletedResource = await this.prisma.resource.delete({
        where: {
          id,
        },
      });
      return deletedResource;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        throw new BadRequestException('Invalid resource ID', error.message);
      }
      throw error;
    }
  }
}
