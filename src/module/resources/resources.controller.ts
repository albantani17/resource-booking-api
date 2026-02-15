import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseInterceptors,
  UseGuards,
} from '@nestjs/common';
import { ResourcesService } from './resources.service';
import { CreateResourceDto } from './dto/create-resource.dto';
import { UpdateResourceDto } from './dto/update-resource.dto';
import { RequestPaginationDto } from '../../common/dto/request.dto';
import { ReturnPaginationDto } from '../../common/dto/response.dto';
import { AuthInterceptor } from '../auth/auth.interceptor';
import { Role } from 'generated/prisma/enums';
import { AuthGuard } from '../auth/auth.guard';


@Controller('resources')
@UseGuards(AuthGuard)
@UseInterceptors(new AuthInterceptor(Role.ADMIN))
export class ResourcesController {
  constructor(private readonly resourcesService: ResourcesService) {}

  @Post()
  create(@Body() createResourceDto: CreateResourceDto) {
    return this.resourcesService.create(createResourceDto);
  }

  @Get()
  async findAll(@Query() query: RequestPaginationDto) {
    const limit = query.limit;
    const offset = (query.page - 1) * query.limit;

    const result = await this.resourcesService.findAll(limit, offset, query.search);

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
  async findOne(@Param('id') id: string) {
    const result = await this.resourcesService.findOne(id);
    return result;
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateResourceDto: UpdateResourceDto,
  ) {
    return this.resourcesService.update(id, updateResourceDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.resourcesService.remove(id);
  }
}
