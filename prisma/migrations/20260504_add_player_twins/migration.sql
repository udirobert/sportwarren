-- PlayerTwins — Kite Passport-backed autonomous agents per player
CREATE TABLE "player_twins" (
    "id" TEXT NOT NULL,
    "profile_id" TEXT NOT NULL,
    "agent_id" TEXT NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 1,
    "xp" INTEGER NOT NULL DEFAULT 0,
    "prestige" INTEGER NOT NULL DEFAULT 0,
    "auto_hire_coaches" BOOLEAN NOT NULL DEFAULT false,
    "auto_compete" BOOLEAN NOT NULL DEFAULT false,
    "weekly_budget_usdc" DOUBLE PRECISION NOT NULL DEFAULT 5.0,
    "base_attributes" JSONB NOT NULL DEFAULT '{}',
    "active_modifiers" JSONB NOT NULL DEFAULT '[]',
    "last_attestation_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "player_twins_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "player_twins_profile_id_key" ON "player_twins"("profile_id");
CREATE UNIQUE INDEX "player_twins_agent_id_key" ON "player_twins"("agent_id");

ALTER TABLE "player_twins" ADD CONSTRAINT "player_twins_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "player_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "player_twins" ADD CONSTRAINT "player_twins_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "ai_agents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- TwinSimulations — overnight tournaments
CREATE TABLE "twin_simulations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "format" TEXT NOT NULL DEFAULT 'round_robin',
    "status" TEXT NOT NULL DEFAULT 'pending',
    "entry_fee_usdc" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total_prize_usdc" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "prize_pool_tx_hash" TEXT,
    "network" TEXT NOT NULL DEFAULT 'kite-testnet',
    "attestation_id" TEXT,
    "started_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "twin_simulations_pkey" PRIMARY KEY ("id")
);

-- TwinSimulationParticipants
CREATE TABLE "twin_simulation_participants" (
    "id" TEXT NOT NULL,
    "simulation_id" TEXT NOT NULL,
    "twin_id" TEXT NOT NULL,
    "wins" INTEGER NOT NULL DEFAULT 0,
    "draws" INTEGER NOT NULL DEFAULT 0,
    "losses" INTEGER NOT NULL DEFAULT 0,
    "goals_for" INTEGER NOT NULL DEFAULT 0,
    "goals_against" INTEGER NOT NULL DEFAULT 0,
    "points" INTEGER NOT NULL DEFAULT 0,
    "prize_usdc" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "twin_simulation_participants_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "twin_simulation_participants_simulation_id_twin_id_key" ON "twin_simulation_participants"("simulation_id", "twin_id");

ALTER TABLE "twin_simulation_participants" ADD CONSTRAINT "twin_simulation_participants_simulation_id_fkey" FOREIGN KEY ("simulation_id") REFERENCES "twin_simulations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "twin_simulation_participants" ADD CONSTRAINT "twin_simulation_participants_twin_id_fkey" FOREIGN KEY ("twin_id") REFERENCES "player_twins"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- TwinSimulationMatches
CREATE TABLE "twin_simulation_matches" (
    "id" TEXT NOT NULL,
    "simulation_id" TEXT NOT NULL,
    "home_twin_id" TEXT NOT NULL,
    "away_twin_id" TEXT NOT NULL,
    "home_score" INTEGER,
    "away_score" INTEGER,
    "round" INTEGER NOT NULL DEFAULT 1,
    "attestation_id" TEXT,
    "played_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "twin_simulation_matches_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "twin_simulation_matches" ADD CONSTRAINT "twin_simulation_matches_simulation_id_fkey" FOREIGN KEY ("simulation_id") REFERENCES "twin_simulations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
