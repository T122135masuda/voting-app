-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "date" TIMESTAMP(3),
ADD COLUMN     "description" TEXT,
ADD COLUMN     "location" TEXT,
ADD COLUMN     "note" TEXT;
