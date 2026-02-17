import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { JwtClaims } from '../auth/interface/auth.interface';
import { RequestPaginationDto } from 'src/common/dto/request.dto';
import { AuthGuard } from '../auth/auth.guard';
import { ReturnPaginationDto } from 'src/common/dto/response.dto';
import { RoleGuard } from '../role/role.guard';
import { Roles } from '../role/role.decorator';
import { Role } from 'generated/prisma/enums';

@Controller('bookings')
@UseGuards(AuthGuard, RoleGuard)
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  @Roles(Role.USER)
  async createBooking(
    @Req() req: { user: JwtClaims },
    @Body() createBookingDto: CreateBookingDto,
  ) {
    return this.bookingsService.createBooking(
      req.user.userId,
      createBookingDto,
    );
  }

  @Get()
  @Roles(Role.ADMIN)
  async findAllBooking(@Query() query: RequestPaginationDto) {
    const limit = query.limit;
    const offset = (query.page - 1) * query.limit;

    const result = await this.bookingsService.findAllBooking(
      limit,
      offset,
      query.search,
    );

    return new ReturnPaginationDto({
      status: 'success',
      message: 'Bookings fetched successfully',
      data: result.data,
      meta: {
        total: result.total,
        page: query.page,
        limit: query.limit,
      },
    });
  }

  @Get('user')
  @Roles(Role.USER)
  async findAllBookingByUser(
    @Req() req: { user: JwtClaims },
    @Query() query: RequestPaginationDto,
  ) {
    const limit = query.limit;
    const offset = (query.page - 1) * query.limit;
    const result = await this.bookingsService.findAllBookingByUser(
      req.user.userId,
      limit,
      offset,
      query.search,
    );
    return new ReturnPaginationDto({
      status: 'success',
      message: 'Bookings fetched successfully',
      data: result.data,
      meta: {
        total: result.total,
        page: query.page,
        limit: query.limit,
      },
    });
  }

  @Post('pay/:bookingId')
  @Roles(Role.USER)
  async payBooking(
    @Req() req: { user: JwtClaims },
    @Param('bookingId') bookingId: string,
  ) {
    return this.bookingsService.payBooking(bookingId, req.user.userId);
  }

  @Post('cancel/:bookingId')
  @Roles(Role.USER)
  async cancelBooking(
    @Req() req: { user: JwtClaims },
    @Param('bookingId') bookingId: string,
  ) {
    return this.bookingsService.cancelBooking(bookingId, req.user.userId);
  }
}
