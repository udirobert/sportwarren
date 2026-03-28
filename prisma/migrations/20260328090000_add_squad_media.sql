-- Squad Media table for private squad sharing
CREATE TABLE IF NOT EXISTS squad_media (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  squad_id TEXT NOT NULL REFERENCES squads(id) ON DELETE CASCADE,
  uploader_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT,
  kind TEXT NOT NULL DEFAULT 'image',
  mime_type TEXT NOT NULL,
  size INTEGER NOT NULL,
  storage_key TEXT NOT NULL,
  visibility TEXT NOT NULL DEFAULT 'squad',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_squad_media_squad ON squad_media(squad_id);
CREATE INDEX IF NOT EXISTS idx_squad_media_uploader ON squad_media(uploader_id);

