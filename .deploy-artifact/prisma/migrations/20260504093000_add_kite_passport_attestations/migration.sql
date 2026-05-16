-- ============================================================================
-- Kite Passport / Attestations / Coaching Effects
-- See prisma/schema.prisma (AiAgent, KiteSession, Attestation, CoachingEffect)
-- ============================================================================

-- AiAgent enhancements (additive)
ALTER TABLE "ai_agents"
  ADD COLUMN IF NOT EXISTS "owner_type"      TEXT,
  ADD COLUMN IF NOT EXISTS "owner_id"        TEXT,
  ADD COLUMN IF NOT EXISTS "wallet_address"  TEXT,
  ADD COLUMN IF NOT EXISTS "service_url"     TEXT,
  ADD COLUMN IF NOT EXISTS "service_price"   TEXT,
  ADD COLUMN IF NOT EXISTS "service_asset"   TEXT DEFAULT 'USDC',
  ADD COLUMN IF NOT EXISTS "service_active"  BOOLEAN NOT NULL DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS "ai_agents_owner_type_owner_id_idx"
  ON "ai_agents" ("owner_type", "owner_id");

-- Kite spending sessions
CREATE TABLE IF NOT EXISTS "kite_sessions" (
  "id"               TEXT PRIMARY KEY,
  "agent_id"         TEXT NOT NULL REFERENCES "ai_agents"("id") ON DELETE CASCADE,
  "task_summary"     TEXT NOT NULL,
  "scope"            JSONB,
  "asset"            TEXT NOT NULL DEFAULT 'USDC',
  "payment_approach" TEXT NOT NULL DEFAULT 'x402_http',
  "max_per_tx"       DOUBLE PRECISION NOT NULL,
  "max_total"        DOUBLE PRECISION NOT NULL,
  "spent"            DOUBLE PRECISION NOT NULL DEFAULT 0,
  "tx_count"         INTEGER NOT NULL DEFAULT 0,
  "status"           TEXT NOT NULL DEFAULT 'pending',
  "approved_by"      TEXT,
  "request_id"       TEXT UNIQUE,
  "expires_at"       TIMESTAMP(3) NOT NULL,
  "created_at"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "kite_sessions_agent_id_status_idx"
  ON "kite_sessions" ("agent_id", "status");

-- Attestations (signed evidence backing every twin stat change)
CREATE TABLE IF NOT EXISTS "attestations" (
  "id"                TEXT PRIMARY KEY,
  "subject_type"      TEXT NOT NULL,
  "subject_id"        TEXT NOT NULL,
  "kind"              TEXT NOT NULL,
  "payload"           JSONB NOT NULL,
  "signer_agent_id"   TEXT REFERENCES "ai_agents"("id"),
  "signature"         TEXT,
  "network"           TEXT NOT NULL DEFAULT 'kite-testnet',
  "tx_hash"           TEXT,
  "facilitator"       TEXT,
  "amount_usdc"       DOUBLE PRECISION,
  "session_id"        TEXT REFERENCES "kite_sessions"("id"),
  "created_at"        TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "attestations_subject_kind_idx"
  ON "attestations" ("subject_type", "subject_id", "kind");
CREATE INDEX IF NOT EXISTS "attestations_tx_hash_idx"
  ON "attestations" ("tx_hash");

-- Coaching effects (time-decaying buffs purchased via x402)
CREATE TABLE IF NOT EXISTS "coaching_effects" (
  "id"             TEXT PRIMARY KEY,
  "target_type"    TEXT NOT NULL,
  "target_id"      TEXT NOT NULL,
  "coach_agent_id" TEXT NOT NULL REFERENCES "ai_agents"("id"),
  "attribute"      TEXT NOT NULL,
  "modifier"       DOUBLE PRECISION NOT NULL,
  "reason"         TEXT,
  "attestation_id" TEXT,
  "amount_usdc"    DOUBLE PRECISION,
  "starts_at"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "expires_at"     TIMESTAMP(3) NOT NULL,
  "active"         BOOLEAN NOT NULL DEFAULT TRUE,
  "created_at"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "coaching_effects_target_active_expires_idx"
  ON "coaching_effects" ("target_type", "target_id", "active", "expires_at");
