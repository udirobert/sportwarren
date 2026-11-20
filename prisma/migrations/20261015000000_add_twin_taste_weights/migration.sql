-- Taste learner weights: per-user, per-kind learned preferences from implicit
-- engagement signals. Engine: src/server/services/personalization/taste-learner.ts
-- (multiplicative factors, floor 0.1 / ceiling 2.0, neutral 0.5).
-- Read by the WhatsApp notification cap gate (notify.ts); written by
-- taste-service.ts as engagement signals land.
CREATE TABLE IF NOT EXISTS "twin_taste_weights" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    "signals" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "twin_taste_weights_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "twin_taste_weights"
    ADD CONSTRAINT "twin_taste_weights_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

CREATE UNIQUE INDEX IF NOT EXISTS "twin_taste_weights_user_id_kind_key" ON "twin_taste_weights"("user_id", "kind");
CREATE INDEX IF NOT EXISTS "twin_taste_weights_user_id_idx" ON "twin_taste_weights"("user_id");
