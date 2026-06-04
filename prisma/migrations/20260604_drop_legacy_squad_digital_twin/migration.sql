-- Migration: drop_legacy_squad_digital_twin
-- PR 2: SquadTwin is the single source of truth for squad personalisation.
-- Drop the legacy columns that were written by `ai/digital-twin.ts` (now
-- removed) and replace them with the corresponding fields on SquadTwin.
--
-- SquadTwin gains:
--   reputation INT NOT NULL DEFAULT 0   (0-1000, mirrors player_twins)
--   attestation_count INT NOT NULL DEFAULT 0
--
-- Squad loses:
--   level, xp, digital_attributes, season_points, squad_energy,
--   last_season_sync, is_digital_twin_active
-- (digital_twin_3d_enabled and digital_twin_3d_tier are kept — that 3D
-- entitlement feature is independent of the twin brain.)

ALTER TABLE "squad_twins"
  ADD COLUMN "reputation"        INT NOT NULL DEFAULT 0,
  ADD COLUMN "attestation_count" INT NOT NULL DEFAULT 0;

ALTER TABLE "squads"
  DROP COLUMN "level",
  DROP COLUMN "xp",
  DROP COLUMN "digital_attributes",
  DROP COLUMN "season_points",
  DROP COLUMN "squad_energy",
  DROP COLUMN "last_season_sync",
  DROP COLUMN "is_digital_twin_active";
