-- Keep permanent match awards idempotent and give twin mutations a durable
-- optimistic-concurrency token. This is additive and safe for deployed DBs.

-- Existing duplicate audit rows must be reconciled before the unique index is
-- created. Leave the historical rows intact and block migration loudly rather
-- than silently choosing a winner.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM "xp_gains"
    WHERE "match_id" IS NOT NULL
    GROUP BY "match_id", "profile_id"
    HAVING COUNT(*) > 1
  ) THEN
    RAISE EXCEPTION 'Duplicate match XP gains exist. Run the report-first reconciliation before applying 20260824000000.';
  END IF;
END $$;

ALTER TABLE "xp_gains"
  ADD CONSTRAINT "xp_gains_match_id_profile_id_key" UNIQUE ("match_id", "profile_id");

ALTER TABLE "player_twins"
  ADD COLUMN IF NOT EXISTS "revision" INTEGER NOT NULL DEFAULT 0;

ALTER TABLE "squad_twins"
  ADD COLUMN IF NOT EXISTS "revision" INTEGER NOT NULL DEFAULT 0;
