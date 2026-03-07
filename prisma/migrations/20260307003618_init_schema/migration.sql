-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT,
    "wallet_address" TEXT NOT NULL,
    "chain" TEXT NOT NULL,
    "name" TEXT,
    "avatar" TEXT,
    "position" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "player_profiles" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 1,
    "total_xp" INTEGER NOT NULL DEFAULT 0,
    "season_xp" INTEGER NOT NULL DEFAULT 0,
    "total_matches" INTEGER NOT NULL DEFAULT 0,
    "total_goals" INTEGER NOT NULL DEFAULT 0,
    "total_assists" INTEGER NOT NULL DEFAULT 0,
    "match_day_preference" INTEGER NOT NULL DEFAULT 0,
    "sharpness" INTEGER NOT NULL DEFAULT 50,
    "reputation_score" INTEGER NOT NULL DEFAULT 100,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "player_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "physical_activities" (
    "id" TEXT NOT NULL,
    "profile_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "intensity" TEXT NOT NULL,
    "distance" DOUBLE PRECISION,
    "calories" INTEGER,
    "source" TEXT NOT NULL DEFAULT 'manual',
    "external_id" TEXT,
    "xp_gained" INTEGER NOT NULL DEFAULT 0,
    "sharpness_gain" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "physical_activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "player_attributes" (
    "id" TEXT NOT NULL,
    "profile_id" TEXT NOT NULL,
    "attribute" TEXT NOT NULL,
    "rating" INTEGER NOT NULL DEFAULT 50,
    "xp" INTEGER NOT NULL DEFAULT 0,
    "xp_to_next" INTEGER NOT NULL DEFAULT 100,
    "max_rating" INTEGER NOT NULL DEFAULT 99,
    "history" INTEGER[],
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "player_attributes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "form_entries" (
    "id" TEXT NOT NULL,
    "profile_id" TEXT NOT NULL,
    "match_id" TEXT NOT NULL,
    "rating" DOUBLE PRECISION NOT NULL,
    "form_value" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "form_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "squads" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "short_name" TEXT NOT NULL,
    "founded" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "home_ground" TEXT,
    "preferred_match_day" INTEGER NOT NULL DEFAULT 0,
    "treasury_balance" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "governor_address" TEXT,
    "token_address" TEXT,

    CONSTRAINT "squads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "squad_members" (
    "id" TEXT NOT NULL,
    "squad_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'player',
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "squad_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "squad_tactics" (
    "id" TEXT NOT NULL,
    "squad_id" TEXT NOT NULL,
    "formation" TEXT NOT NULL DEFAULT '4-4-2',
    "play_style" TEXT NOT NULL DEFAULT 'balanced',
    "instructions" JSONB,
    "set_pieces" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "squad_tactics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "squad_treasury" (
    "id" TEXT NOT NULL,
    "squad_id" TEXT NOT NULL,
    "balance" INTEGER NOT NULL DEFAULT 0,
    "budgets" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "squad_treasury_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "treasury_transactions" (
    "id" TEXT NOT NULL,
    "treasury_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "description" TEXT,
    "tx_hash" TEXT,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "treasury_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transfer_offers" (
    "id" TEXT NOT NULL,
    "from_squad_id" TEXT NOT NULL,
    "to_squad_id" TEXT NOT NULL,
    "player_id" TEXT NOT NULL,
    "offer_type" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "loan_duration" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "expires_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transfer_offers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "match_challenges" (
    "id" TEXT NOT NULL,
    "from_squad_id" TEXT NOT NULL,
    "to_squad_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "proposed_date" TIMESTAMP(3) NOT NULL,
    "pitch_id" TEXT,
    "message" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "match_challenges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pitches" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "controlling_squad_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pitches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "matches" (
    "id" TEXT NOT NULL,
    "home_squad_id" TEXT NOT NULL,
    "away_squad_id" TEXT NOT NULL,
    "home_score" INTEGER,
    "away_score" INTEGER,
    "submitted_by" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "match_date" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "weather_verified" BOOLEAN NOT NULL DEFAULT false,
    "location_verified" BOOLEAN NOT NULL DEFAULT false,
    "pitch_id" TEXT,
    "tx_id" TEXT,

    CONSTRAINT "matches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "match_verifications" (
    "id" TEXT NOT NULL,
    "match_id" TEXT NOT NULL,
    "verifier_id" TEXT NOT NULL,
    "verified" BOOLEAN NOT NULL,
    "home_score" INTEGER,
    "away_score" INTEGER,
    "trust_tier" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "match_verifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "player_match_stats" (
    "id" TEXT NOT NULL,
    "match_id" TEXT NOT NULL,
    "profile_id" TEXT NOT NULL,
    "goals" INTEGER NOT NULL DEFAULT 0,
    "assists" INTEGER NOT NULL DEFAULT 0,
    "clean_sheet" BOOLEAN NOT NULL DEFAULT false,
    "rating" DOUBLE PRECISION,
    "minutes_played" INTEGER NOT NULL DEFAULT 90,
    "xp_earned" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "player_match_stats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "xp_gains" (
    "id" TEXT NOT NULL,
    "match_id" TEXT,
    "profile_id" TEXT NOT NULL,
    "base_xp" INTEGER NOT NULL,
    "bonus_xp" INTEGER NOT NULL DEFAULT 0,
    "total_xp" INTEGER NOT NULL,
    "source" TEXT NOT NULL,
    "description" TEXT,
    "attribute_breakdown" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "xp_gains_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "achievements" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "requirement" JSONB NOT NULL,
    "xp_reward" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "achievements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "player_achievements" (
    "id" TEXT NOT NULL,
    "profile_id" TEXT NOT NULL,
    "achievement_id" TEXT NOT NULL,
    "unlocked_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "player_achievements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_agents" (
    "id" TEXT NOT NULL,
    "agent_id" TEXT NOT NULL,
    "passport_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "reputation" INTEGER NOT NULL DEFAULT 100,
    "capabilities" TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_agents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_wallet_address_key" ON "users"("wallet_address");

-- CreateIndex
CREATE UNIQUE INDEX "player_profiles_user_id_key" ON "player_profiles"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "player_attributes_profile_id_attribute_key" ON "player_attributes"("profile_id", "attribute");

-- CreateIndex
CREATE UNIQUE INDEX "squad_members_squad_id_user_id_key" ON "squad_members"("squad_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "squad_tactics_squad_id_key" ON "squad_tactics"("squad_id");

-- CreateIndex
CREATE UNIQUE INDEX "squad_treasury_squad_id_key" ON "squad_treasury"("squad_id");

-- CreateIndex
CREATE UNIQUE INDEX "match_verifications_match_id_verifier_id_key" ON "match_verifications"("match_id", "verifier_id");

-- CreateIndex
CREATE UNIQUE INDEX "player_match_stats_match_id_profile_id_key" ON "player_match_stats"("match_id", "profile_id");

-- CreateIndex
CREATE UNIQUE INDEX "achievements_type_key" ON "achievements"("type");

-- CreateIndex
CREATE UNIQUE INDEX "player_achievements_profile_id_achievement_id_key" ON "player_achievements"("profile_id", "achievement_id");

-- CreateIndex
CREATE UNIQUE INDEX "ai_agents_agent_id_key" ON "ai_agents"("agent_id");

-- CreateIndex
CREATE UNIQUE INDEX "ai_agents_passport_id_key" ON "ai_agents"("passport_id");

-- AddForeignKey
ALTER TABLE "player_profiles" ADD CONSTRAINT "player_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "physical_activities" ADD CONSTRAINT "physical_activities_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "player_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "player_attributes" ADD CONSTRAINT "player_attributes_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "player_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "form_entries" ADD CONSTRAINT "form_entries_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "player_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "squad_members" ADD CONSTRAINT "squad_members_squad_id_fkey" FOREIGN KEY ("squad_id") REFERENCES "squads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "squad_members" ADD CONSTRAINT "squad_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "squad_tactics" ADD CONSTRAINT "squad_tactics_squad_id_fkey" FOREIGN KEY ("squad_id") REFERENCES "squads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "squad_treasury" ADD CONSTRAINT "squad_treasury_squad_id_fkey" FOREIGN KEY ("squad_id") REFERENCES "squads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "treasury_transactions" ADD CONSTRAINT "treasury_transactions_treasury_id_fkey" FOREIGN KEY ("treasury_id") REFERENCES "squad_treasury"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transfer_offers" ADD CONSTRAINT "transfer_offers_from_squad_id_fkey" FOREIGN KEY ("from_squad_id") REFERENCES "squads"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transfer_offers" ADD CONSTRAINT "transfer_offers_to_squad_id_fkey" FOREIGN KEY ("to_squad_id") REFERENCES "squads"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_challenges" ADD CONSTRAINT "match_challenges_from_squad_id_fkey" FOREIGN KEY ("from_squad_id") REFERENCES "squads"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_challenges" ADD CONSTRAINT "match_challenges_to_squad_id_fkey" FOREIGN KEY ("to_squad_id") REFERENCES "squads"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_challenges" ADD CONSTRAINT "match_challenges_pitch_id_fkey" FOREIGN KEY ("pitch_id") REFERENCES "pitches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_home_squad_id_fkey" FOREIGN KEY ("home_squad_id") REFERENCES "squads"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_away_squad_id_fkey" FOREIGN KEY ("away_squad_id") REFERENCES "squads"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_submitted_by_fkey" FOREIGN KEY ("submitted_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_pitch_id_fkey" FOREIGN KEY ("pitch_id") REFERENCES "pitches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_verifications" ADD CONSTRAINT "match_verifications_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "matches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_verifications" ADD CONSTRAINT "match_verifications_verifier_id_fkey" FOREIGN KEY ("verifier_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "player_match_stats" ADD CONSTRAINT "player_match_stats_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "matches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "player_match_stats" ADD CONSTRAINT "player_match_stats_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "player_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "xp_gains" ADD CONSTRAINT "xp_gains_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "matches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "player_achievements" ADD CONSTRAINT "player_achievements_achievement_id_fkey" FOREIGN KEY ("achievement_id") REFERENCES "achievements"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
