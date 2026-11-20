-- Per-identity notification language. User-set via Settings → Notifications
-- today; can later be auto-captured from Telegram's language_code on link.
ALTER TABLE "platform_identities" ADD COLUMN IF NOT EXISTS "locale" TEXT;
