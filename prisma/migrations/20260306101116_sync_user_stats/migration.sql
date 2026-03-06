/*
  Warnings:

  - You are about to drop the column `consecutiveDays` on the `UserStats` table. All the data in the column will be lost.
  - The `badges` column on the `UserStats` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Timetable" ADD COLUMN     "className" TEXT;

-- AlterTable
ALTER TABLE "UserStats" DROP COLUMN "consecutiveDays",
ADD COLUMN     "classAttendanceStreak" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "perfectWeeks" INTEGER NOT NULL DEFAULT 0,
DROP COLUMN "badges",
ADD COLUMN     "badges" TEXT[];
