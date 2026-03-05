-- AlterTable
ALTER TABLE "UserStats" ADD COLUMN     "badges" JSONB DEFAULT '[]',
ADD COLUMN     "consecutiveDays" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "lastCheckIn" TIMESTAMP(3);
