-- Add team_side column to player_match_stats for player-to-player rivalry tracking
-- 'home' = player was on the home team, 'away' = player was on the away team
ALTER TABLE "player_match_stats" ADD COLUMN "team_side" TEXT;
