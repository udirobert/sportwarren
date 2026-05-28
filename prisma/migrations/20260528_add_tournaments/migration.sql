-- CreateTable
CREATE TABLE "tournaments" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'open',
    "max_entries" INTEGER NOT NULL DEFAULT 8,
    "created_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "tournaments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tournament_entries" (
    "id" TEXT NOT NULL,
    "tournament_id" TEXT NOT NULL,
    "user_id" TEXT,
    "squad_id" TEXT,
    "seed_number" INTEGER NOT NULL,
    "formation" TEXT NOT NULL,
    "play_style" TEXT NOT NULL DEFAULT 'balanced',
    "color" TEXT NOT NULL DEFAULT '#3b82f6',
    "player_names" JSONB,
    "entered_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tournament_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tournament_matches" (
    "id" TEXT NOT NULL,
    "tournament_id" TEXT NOT NULL,
    "round" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "home_entry_id" TEXT NOT NULL,
    "away_entry_id" TEXT NOT NULL,
    "home_score" INTEGER,
    "away_score" INTEGER,
    "events" JSONB,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "played_at" TIMESTAMP(3),

    CONSTRAINT "tournament_matches_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "tournaments_status_created_at_idx" ON "tournaments"("status", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "tournament_entries_tournament_id_seed_number_key" ON "tournament_entries"("tournament_id", "seed_number");

-- CreateIndex
CREATE INDEX "tournament_entries_tournament_id_idx" ON "tournament_entries"("tournament_id");

-- CreateIndex
CREATE UNIQUE INDEX "tournament_matches_tournament_id_round_position_key" ON "tournament_matches"("tournament_id", "round", "position");

-- CreateIndex
CREATE INDEX "tournament_matches_tournament_id_round_idx" ON "tournament_matches"("tournament_id", "round");

-- AddForeignKey
ALTER TABLE "tournament_entries" ADD CONSTRAINT "tournament_entries_tournament_id_fkey" FOREIGN KEY ("tournament_id") REFERENCES "tournaments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tournament_matches" ADD CONSTRAINT "tournament_matches_tournament_id_fkey" FOREIGN KEY ("tournament_id") REFERENCES "tournaments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tournament_matches" ADD CONSTRAINT "tournament_matches_home_entry_id_fkey" FOREIGN KEY ("home_entry_id") REFERENCES "tournament_entries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tournament_matches" ADD CONSTRAINT "tournament_matches_away_entry_id_fkey" FOREIGN KEY ("away_entry_id") REFERENCES "tournament_entries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
