-- Create platform_connections table if not exists (for shadow database compatibility)
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

-- Drop group_address column if it exists
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'platform_connections' AND column_name = 'group_address'
    ) THEN
        ALTER TABLE "platform_connections" DROP COLUMN "group_address";
    END IF;
END $$;

-- Create prediction markets tables
CREATE TABLE "prediction_markets" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "question" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "sport_type" TEXT,
    "creator_id" TEXT NOT NULL,
    "creator_name" TEXT,
    "deadline" TIMESTAMP(3) NOT NULL,
    "settle_by" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "result" TEXT,
    "total_pool" BIGINT NOT NULL DEFAULT 0,
    "creator_fee" BIGINT NOT NULL DEFAULT 0,
    "ai_verified" BOOLEAN NOT NULL DEFAULT false,
    "ai_reasoning" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL
);

CREATE TABLE "prediction_options" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "market_id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "odds" DOUBLE PRECISION NOT NULL DEFAULT 2.0,
    "total_bet" BIGINT NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "prediction_options_market_id_text_key" UNIQUE ("market_id", "text"),
    CONSTRAINT "prediction_options_market_id_fkey" FOREIGN KEY ("market_id") REFERENCES "prediction_markets"("id") ON DELETE CASCADE
);

CREATE TABLE "prediction_bets" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "market_id" TEXT NOT NULL,
    "option_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "user_name" TEXT,
    "amount" BIGINT NOT NULL,
    "potential_win" BIGINT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "message_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "prediction_bets_market_id_fkey" FOREIGN KEY ("market_id") REFERENCES "prediction_markets"("id") ON DELETE CASCADE,
    CONSTRAINT "prediction_bets_option_id_fkey" FOREIGN KEY ("option_id") REFERENCES "prediction_options"("id") ON DELETE CASCADE
);

CREATE INDEX "prediction_markets_status_idx" ON "prediction_markets"("status");
CREATE INDEX "prediction_markets_deadline_idx" ON "prediction_markets"("deadline");
CREATE INDEX "prediction_options_market_id_idx" ON "prediction_options"("market_id");
CREATE INDEX "prediction_bets_market_id_idx" ON "prediction_bets"("market_id");
CREATE INDEX "prediction_bets_user_id_idx" ON "prediction_bets"("user_id");