import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ResourcesService } from './resources.service';
import { CreateResourceDto } from './dto/create-resource.dto';
import { UpdateResourceDto } from './dto/update-resource.dto';
import { RequestPaginationDto } from '../../common/dto/request.dto';
import { ReturnPaginationDto } from '../../common/dto/response.dto';
import { Role } from 'generated/prisma/enums';
import { AuthGuard } from '../auth/auth.guard';
import { Roles } from '../role/role.decorator';
import { RoleGuard } from '../role/role.guard';

@Controller('resources')
@UseGuards(AuthGuard, RoleGuard)
export class ResourcesController {
  constructor(private readonly resourcesService: ResourcesService) {}

  @Post()
  @Roles(Role.ADMIN)
  create(@Body() createResourceDto: CreateResourceDto) {
    return this.resourcesService.create(createResourceDto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.USER)
  async findAll(@Query() query: RequestPaginationDto) {
    const limit = query.limit;
    const offset = (query.page - 1) * query.limit;

    const result = await this.resourcesService.findAll(
      limit,
      offset,
      query.search,
    );

    return new ReturnPaginationDto({
      status: 'success',
      message: 'Resources fetched successfully',
      data: result.resources,
      meta: {
        total: result.total,
        page: query.page,
        limit: query.limit,
      },
    });
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.USER)
  async findOne(@Param('id') id: string) {
    const result = await this.resourcesService.findOne(id);
    return result;
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  update(
    @Param('id') id: string,
    @Body() updateResourceDto: UpdateResourceDto,
  ) {
    return this.resourcesService.update(id, updateResourceDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.resourcesService.remove(id);
  }
}
