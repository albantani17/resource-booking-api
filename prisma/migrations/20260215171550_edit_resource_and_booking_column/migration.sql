/*
  Warnings:

  - You are about to drop the column `space` on the `Resource` table. All the data in the column will be lost.
  - Added the required column `priceAtBooking` to the `Booking` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "BookingStatus" ADD VALUE 'CANCELLED';

-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "priceAtBooking" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Resource" DROP COLUMN "space",
ADD COLUMN     "price" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "slot" INTEGER NOT NULL DEFAULT 1;
