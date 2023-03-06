/*
  Warnings:

  - You are about to drop the column `description` on the `Device` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Device" DROP COLUMN "description",
ADD COLUMN     "item_id" TEXT,
ADD COLUMN     "item_name" TEXT;

-- AlterTable
ALTER TABLE "Token" ALTER COLUMN "date_expires" SET DEFAULT NOW() + interval '10 minutes';
