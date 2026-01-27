-- CreateEnum
CREATE TYPE "SongStatus" AS ENUM ('PRACTICING', 'LEARNED', 'MASTERED');

-- AlterTable
ALTER TABLE "songs" ADD COLUMN     "status" "SongStatus" NOT NULL DEFAULT 'LEARNED';
