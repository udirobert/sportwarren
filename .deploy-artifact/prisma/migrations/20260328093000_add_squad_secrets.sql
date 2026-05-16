-- Squad secrets (e.g., per-squad media encryption key)
CREATE TABLE IF NOT EXISTS squad_secrets (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  squad_id TEXT NOT NULL REFERENCES squads(id) ON DELETE CASCADE,
  kind TEXT NOT NULL,
  key_enc TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(squad_id, kind)
);

