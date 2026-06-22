-- Add PlayerPerception — choice-based multiple-choice quiz answers
-- about how a player plays (descriptive) vs should play (prescriptive).
-- Distinct from PeerRating which is score-based (1-10). See
-- `src/server/services/perception/scenarios.ts` for the scenario library.

CREATE TABLE "player_perceptions" (
  "id" TEXT NOT NULL,
  "rater_id" TEXT NOT NULL,
  "target_id" TEXT NOT NULL,
  "scenario_id" TEXT NOT NULL,
  "choice" TEXT NOT NULL,
  "kind" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "player_perceptions_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "player_perceptions_rater_id_target_id_scenario_id_kind_key"
  ON "player_perceptions"("rater_id", "target_id", "scenario_id", "kind");

CREATE INDEX "player_perceptions_target_id_idx"
  ON "player_perceptions"("target_id");

ALTER TABLE "player_perceptions"
  ADD CONSTRAINT "player_perceptions_rater_id_fkey"
  FOREIGN KEY ("rater_id") REFERENCES "player_profiles"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "player_perceptions"
  ADD CONSTRAINT "player_perceptions_target_id_fkey"
  FOREIGN KEY ("target_id") REFERENCES "player_profiles"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
