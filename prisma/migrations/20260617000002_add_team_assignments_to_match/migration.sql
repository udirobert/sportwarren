-- Add team_assignments JSON column to matches table
-- Stores which player profiles were on which team for fluid session formats
-- Structure: { "home": ["profileId1", ...], "away": ["profileId2", ...] }
ALTER TABLE "matches" ADD COLUMN "team_assignments" JSONB;
