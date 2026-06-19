-- Add avatar lock flag so captains can freeze a player's avatar
ALTER TABLE "users" ADD COLUMN "avatar_locked" BOOLEAN NOT NULL DEFAULT false;
