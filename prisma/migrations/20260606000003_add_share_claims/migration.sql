-- Migration: add share_claims table
-- Adds the ShareClaim model that lets users claim a position slot on a shared tactical plan.

CREATE TABLE "share_claims" (
    "id"             TEXT NOT NULL,
    "share_id"       TEXT NOT NULL,
    "position_index" INTEGER NOT NULL,
    "display_name"   TEXT NOT NULL,
    "remix_slug"     TEXT,
    "user_id"        TEXT,
    "claimed_at"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"     TIMESTAMP(3) NOT NULL,

    CONSTRAINT "share_claims_pkey" PRIMARY KEY ("id")
);

-- Unique: one claim per position per share
CREATE UNIQUE INDEX "share_claims_share_id_position_index_key"
  ON "share_claims"("share_id", "position_index");

-- Unique: remix slugs are globally unique
CREATE UNIQUE INDEX "share_claims_remix_slug_key"
  ON "share_claims"("remix_slug");

-- FK to tactical_plan_shares with cascade delete
ALTER TABLE "share_claims"
  ADD CONSTRAINT "share_claims_share_id_fkey"
  FOREIGN KEY ("share_id")
  REFERENCES "tactical_plan_shares"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

-- Index for lookups by share_id
CREATE INDEX "share_claims_share_id_idx"
  ON "share_claims"("share_id");
