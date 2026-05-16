-- AlterTable
ALTER TABLE "matches" ADD COLUMN     "has_keeper" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "match_format" TEXT NOT NULL DEFAULT '11v11',
ADD COLUMN     "players_per_side" INTEGER NOT NULL DEFAULT 11;
