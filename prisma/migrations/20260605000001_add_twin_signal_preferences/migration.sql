-- CreateTable
CREATE TABLE "twin_signal_preferences" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "twin_signal_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "twin_signal_preferences_user_id_channel_kind_key" ON "twin_signal_preferences"("user_id", "channel", "kind");

-- CreateIndex
CREATE INDEX "twin_signal_preferences_user_id_channel_idx" ON "twin_signal_preferences"("user_id", "channel");

-- AddForeignKey
ALTER TABLE "twin_signal_preferences" ADD CONSTRAINT "twin_signal_preferences_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
