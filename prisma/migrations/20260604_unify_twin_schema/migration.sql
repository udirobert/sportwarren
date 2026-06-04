-- Migration: unify_twin_schema (Phase 1 — additive only)
-- Phase 1 of the unified player identity plan: skin (avatar) + brain (twin).
-- Avatar lives in `src/server/services/personalization/image.ts`; brain in
-- `twin-types.ts` / `twin-appliers.ts`. This migration is forward-only: it
-- adds the new fields and the new squad_twins table. Destructive changes
-- (drop of PlayerProfile.sharpness, PlayerProfile.reputationScore, etc.)
-- come in PR 2 once TwinService is wired up to replace the read sites.

-- 1. New fields on player_twins: reputation + attestation_count.
-- The appliers in `twin-appliers.ts` use these for the diff model; the
-- orchestrator (PR 2) will write them.
ALTER TABLE "player_twins"
    ADD COLUMN IF NOT EXISTS "reputation" INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS "attestation_count" INTEGER NOT NULL DEFAULT 0;

-- 2. New squad_twins table. A squad twin is its own brain — distinct from
-- any player twin. The link to player_twins is intentionally absent here;
-- we will add it once the service-level scope: 'squad' is fully wired.
CREATE TABLE IF NOT EXISTS "squad_twins" (
    "id" TEXT NOT NULL,
    "squad_id" TEXT NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 1,
    "xp" INTEGER NOT NULL DEFAULT 0,
    "prestige" INTEGER NOT NULL DEFAULT 0,
    "base_attributes" JSONB NOT NULL DEFAULT '{}',
    "energy" INTEGER NOT NULL DEFAULT 100,
    "energy_max" INTEGER NOT NULL DEFAULT 100,
    "consensus_tags" JSONB,
    "twin_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "squad_twins_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "squad_twins_squad_id_key" ON "squad_twins"("squad_id");

ALTER TABLE "squad_twins"
    ADD CONSTRAINT "squad_twins_squad_id_fkey"
    FOREIGN KEY ("squad_id") REFERENCES "squads"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
