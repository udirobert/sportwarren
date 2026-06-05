CREATE TABLE "tactical_plan_shares" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "fingerprint" TEXT NOT NULL,
    "formation" TEXT NOT NULL,
    "play_style" TEXT NOT NULL,
    "squad_size" INTEGER NOT NULL,
    "color" TEXT,
    "names" JSONB NOT NULL DEFAULT '[]',
    "plan" JSONB NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'playground',
    "created_by_user_id" TEXT,
    "view_count" INTEGER NOT NULL DEFAULT 0,
    "copy_count" INTEGER NOT NULL DEFAULT 0,
    "last_viewed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tactical_plan_shares_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "tactical_plan_shares_slug_key" ON "tactical_plan_shares"("slug");
CREATE UNIQUE INDEX "tactical_plan_shares_fingerprint_key" ON "tactical_plan_shares"("fingerprint");
CREATE INDEX "tactical_plan_shares_created_at_idx" ON "tactical_plan_shares"("created_at");
CREATE INDEX "tactical_plan_shares_formation_play_style_squad_size_idx" ON "tactical_plan_shares"("formation", "play_style", "squad_size");
