import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { BookingPaymentStatus, BookingStatus } from 'generated/prisma/enums';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class BookingsService {
  private readonly logger = new Logger(BookingsService.name);
  constructor(private readonly prismaService: PrismaService) {}

  async createBooking(userId: string, createBookingDto: CreateBookingDto) {
    const { resourceId, startTime, endTime, slots } = createBookingDto;

    const now = new Date();

    if (new Date(startTime) < now) {
      throw new BadRequestException('Start time must be after now');
    }

    if (new Date(endTime) < now) {
      throw new BadRequestException('End time must be after now');
    }

    if (new Date(startTime) >= new Date(endTime)) {
      throw new BadRequestException('Start time must be before end time');
    }

    try {
      const transaction = await this.prismaService.$transaction(async (tx) => {
        await tx.$queryRaw`
      SELECT id FROM "Resource"
      WHERE id = ${resourceId}
      FOR UPDATE
      `;

        const resource = await tx.resource.findUnique({
          where: { id: resourceId },
        });

        if (!resource) {
          throw new BadRequestException('Resource not found');
        }

        const overlapping = await tx.booking.aggregate({
          _sum: {
            slots: true,
          },
          where: {
            resourceId,
            status: { in: [BookingStatus.PENDING, BookingStatus.CONFIRMED] },
            startTime: { lt: endTime },
            endTime: { gt: startTime },
          },
        });

        const usedSlot = overlapping._sum.slots ?? 0;

        if (usedSlot + slots > resource.capacity) {
          throw new BadRequestException('Resource is not available');
        }

        const durationInMinutes =
          (new Date(endTime).getTime() - new Date(startTime).getTime()) / 60000;
        const totalAmount = Math.ceil(durationInMinutes / 60) * resource.price;

        const booking = await tx.booking.create({
          data: {
            userId,
            resourceId,
            startTime: new Date(startTime),
            endTime: new Date(endTime),
            slots,
            priceAtBooking: resource.price,
            totalAmount: totalAmount,
            expiredAt: new Date(new Date(endTime).getTime() + 15 * 60 * 1000),
          },
        });

        return booking;
      });

      return transaction;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }
  }

  async payBooking(bookingId: string, userId: string) {
    const transaction = await this.prismaService.$transaction(async (tx) => {
      const booking = await tx.booking.findUnique({
        where: { id: bookingId, userId },
      });

      if (!booking) {
        throw new BadRequestException('Booking not found');
      }

      if (booking.status !== BookingStatus.PENDING) {
        throw new BadRequestException('Booking is not in PENDING state');
      }

      const updatedBooking = await tx.booking.update({
        where: { id: bookingId, userId },
        data: {
          status: BookingStatus.CONFIRMED,
          paymentAt: new Date(),
          paymentStatus: BookingPaymentStatus.PAID,
        },
      });

      return updatedBooking;
    });

    return transaction;
  }

  async cancelBooking(bookingId: string, userId: string) {
    const transaction = await this.prismaService.$transaction(async (tx) => {
      const booking = await tx.booking.findUnique({
        where: { id: bookingId, userId },
      });

      if (!booking) {
        throw new BadRequestException('Booking not found');
      }

      if (booking.status !== BookingStatus.PENDING) {
        throw new BadRequestException('Booking is not in PENDING state');
      }

      const updatedBooking = await tx.booking.update({
        where: { id: bookingId, userId },
        data: {
          status: BookingStatus.CANCELLED,
          paymentStatus: BookingPaymentStatus.FAILED,
        },
      });

      return updatedBooking;
    });

    return transaction;
  }

  async findAllBooking(limit: number, offset: number, search: string) {
    try {
      const [bookings, count] = await this.prismaService.$transaction([
        this.prismaService.booking.findMany({
          take: limit,
          skip: offset,
          where: {
            OR: [
              { user: { name: { mode: 'insensitive', contains: search } } },
              { resource: { name: { mode: 'insensitive', contains: search } } },
            ],
          },
          include: {
            resource: {
              select: {
                id: true,
                name: true,
                capacity: true,
                price: true,
              },
            },
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        }),
        this.prismaService.booking.count({
          where: {
            OR: [
              { user: { name: { mode: 'insensitive', contains: search } } },
              { resource: { name: { mode: 'insensitive', contains: search } } },
            ],
          },
        }),
      ]);

      return {
        data: bookings,
        total: count,
      };
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }
  }

  async findAllBookingByUser(
    userId: string,
    limit: number,
    offset: number,
    search: string,
  ) {
    try {
      const [bookings, count] = await this.prismaService.$transaction([
        this.prismaService.booking.findMany({
          take: limit,
          skip: offset,
          where: {
            userId,
            OR: [
              { user: { name: { mode: 'insensitive', contains: search } } },
              { resource: { name: { mode: 'insensitive', contains: search } } },
            ],
          },
          include: {
            resource: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        }),
        this.prismaService.booking.count({
          where: {
            userId,
            OR: [
              { user: { name: { mode: 'insensitive', contains: search } } },
              { resource: { name: { mode: 'insensitive', contains: search } } },
            ],
          },
        }),
      ]);

      return {
        data: bookings,
        total: count,
      };
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }
  }

  @Cron('* * * * *')
  async checkExpiredPaymentBooking() {
    try {
      const bookings = await this.prismaService.booking.findMany({
        where: {
          expiredAt: { lt: new Date() },

          status: BookingStatus.PENDING,
        },
      });

      if (bookings.length === 0) {
        this.logger.log(`No expired bookings found at ${new Date()}`);
        return;
      }

      for (const booking of bookings) {
        await this.prismaService.booking.update({
          where: { id: booking.id },
          data: {
            status: BookingStatus.CANCELLED,
            paymentStatus: BookingPaymentStatus.FAILED,
          },
        });
        this.logger.log(`Booking ${booking.id} has been cancelled`);
      }

      this.logger.log(`Checked expired bookings at ${new Date()}`);
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }
  }

  @Cron('* * * * *')
  async checkExpiredBooking() {
    try {
      const bookings = await this.prismaService.booking.findMany({
        where: {
          endTime: { lt: new Date() },

          status: BookingStatus.CONFIRMED
        },
      });

      if (bookings.length === 0) {
        this.logger.log(`No expired bookings found at ${new Date()}`);
        return;
      }

      for (const booking of bookings) {
        await this.prismaService.booking.update({
          where: { id: booking.id },
          data: {
            status: BookingStatus.COMPLETED,
          },
        });
        this.logger.log(`Booking ${booking.id} has been completed`);
      }

      this.logger.log(`Checked expired bookings at ${new Date()}`);
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }
  }
}
