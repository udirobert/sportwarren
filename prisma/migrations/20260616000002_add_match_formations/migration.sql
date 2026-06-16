-- Add formation per side to matches table
-- Captures the tactical formation each squad used at match submission time
ALTER TABLE "matches" ADD COLUMN "home_formation" TEXT;
ALTER TABLE "matches" ADD COLUMN "away_formation" TEXT;
