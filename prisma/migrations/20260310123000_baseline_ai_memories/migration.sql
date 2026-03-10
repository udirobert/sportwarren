-- Baseline ai_memories table (existing in DB)
CREATE TABLE IF NOT EXISTS "ai_memories" (
  "id" TEXT NOT NULL,
  "user_id" TEXT NOT NULL,
  "history" JSONB NOT NULL DEFAULT '[]',
  "key_insights" JSONB NOT NULL DEFAULT '[]',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "ai_memories_user_id_key" ON "ai_memories"("user_id");

ALTER TABLE "ai_memories" ADD CONSTRAINT "ai_memories_user_id_fkey"
FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
