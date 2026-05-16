-- CreateTable if not exists (for shadow database compatibility)
CREATE TABLE IF NOT EXISTS "platform_connections" (
    "id" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "user_id" TEXT NOT NULL,
    "squad_id" TEXT,
    "username" TEXT,
    "chat_id" TEXT,
    "platform_user_id" TEXT,
    "link_token" TEXT,
    "linked_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "platform_connections_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "platform_connections"
ADD COLUMN IF NOT EXISTS "mini_app_token" TEXT,
ADD COLUMN IF NOT EXISTS "mini_app_token_expires_at" TIMESTAMP WITH TIME ZONE;

CREATE UNIQUE INDEX IF NOT EXISTS "platform_connections_mini_app_token_key"
ON "platform_connections"("mini_app_token");

ALTER TABLE "squad_treasury"
ADD COLUMN IF NOT EXISTS "ton_wallet_address" TEXT;

ALTER TABLE "treasury_transactions"
ADD COLUMN IF NOT EXISTS "metadata" JSONB;