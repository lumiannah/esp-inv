-- AlterTable
ALTER TABLE "Token" ALTER COLUMN "date_expires" SET DEFAULT NOW() + interval '10 minutes';

-- CreateTable
CREATE TABLE "SensorData" (
    "id" SERIAL NOT NULL,
    "device_id" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "value" INTEGER NOT NULL,

    CONSTRAINT "SensorData_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "SensorData" ADD CONSTRAINT "SensorData_device_id_fkey" FOREIGN KEY ("device_id") REFERENCES "Device"("id") ON DELETE CASCADE ON UPDATE CASCADE;
