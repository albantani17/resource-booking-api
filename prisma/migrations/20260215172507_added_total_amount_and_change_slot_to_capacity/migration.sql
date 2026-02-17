/*
  Warnings:

  - You are about to drop the column `slot` on the `Resource` table. All the data in the column will be lost.
  - Added the required column `slots` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalAmount` to the `Booking` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "slots" INTEGER NOT NULL,
ADD COLUMN     "totalAmount" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Resource" DROP COLUMN "slot",
ADD COLUMN     "capacity" INTEGER NOT NULL DEFAULT 1;
