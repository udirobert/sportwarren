-- AlterTable
ALTER TABLE "users" ADD COLUMN     "strava_access_token" TEXT,
ADD COLUMN     "strava_athlete_id" TEXT,
ADD COLUMN     "strava_connected_at" TIMESTAMP(3),
ADD COLUMN     "strava_refresh_token" TEXT,
ADD COLUMN     "strava_scopes" TEXT,
ADD COLUMN     "strava_token_expires_at" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "users_strava_athlete_id_key" ON "users"("strava_athlete_id");
