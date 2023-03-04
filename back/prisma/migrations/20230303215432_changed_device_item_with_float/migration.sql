-- AlterTable
ALTER TABLE "Device" ALTER COLUMN "item_width" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "Token" ALTER COLUMN "date_expires" SET DEFAULT NOW() + interval '10 minutes';
