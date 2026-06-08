-- Migration: add goat_agent_id to player_profiles
-- Stores the GOAT Network ERC-8004 agent ID registered for this player
-- during onboarding. Null means registration hasn't been attempted or
-- Goat Network is not configured.

ALTER TABLE "player_profiles"
  ADD COLUMN "goat_agent_id" INTEGER;
