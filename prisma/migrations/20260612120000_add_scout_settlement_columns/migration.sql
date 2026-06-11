-- Add deferred settlement tracking columns to Attestation.
-- Supports async settlement of scout report payments: the report is returned
-- instantly with settlementStatus='pending', then a cron worker settles on-chain
-- and updates the row to 'settled' or 'failed'.

ALTER TABLE "attestations" ADD COLUMN IF NOT EXISTS "settlement_status" TEXT;
ALTER TABLE "attestations" ADD COLUMN IF NOT EXISTS "settlement_attempts" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "attestations" ADD COLUMN IF NOT EXISTS "settlement_error" TEXT;
ALTER TABLE "attestations" ADD COLUMN IF NOT EXISTS "settled_at" TIMESTAMP(3);

-- Backfill: all existing attestations were settled at write time (either real
-- or simulated). Mark them as 'settled' so the worker does not retry them.
UPDATE "attestations"
SET "settlement_status" = 'settled'
WHERE "settlement_status" IS NULL;

-- Index for the settlement worker to efficiently find pending rows.
CREATE INDEX IF NOT EXISTS "attestations_settlement_pending_idx"
ON "attestations"("settlement_status", "created_at")
WHERE "settlement_status" = 'pending';
