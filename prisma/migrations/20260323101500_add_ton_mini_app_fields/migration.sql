ALTER TABLE "platform_connections"
ADD COLUMN IF NOT EXISTS "mini_app_token" TEXT,
ADD COLUMN IF NOT EXISTS "mini_app_token_expires_at" TIMESTAMP WITH TIME ZONE;

CREATE UNIQUE INDEX IF NOT EXISTS "platform_connections_mini_app_token_key"
ON "platform_connections"("mini_app_token");

ALTER TABLE "squad_treasury"
ADD COLUMN IF NOT EXISTS "ton_wallet_address" TEXT;

ALTER TABLE "treasury_transactions"
ADD COLUMN IF NOT EXISTS "metadata" JSONB;
