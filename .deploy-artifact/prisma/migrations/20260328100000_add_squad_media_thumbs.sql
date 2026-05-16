ALTER TABLE squad_media
  ADD COLUMN IF NOT EXISTS thumb_storage_key TEXT,
  ADD COLUMN IF NOT EXISTS thumb_mime_type TEXT,
  ADD COLUMN IF NOT EXISTS thumb_size INTEGER;

