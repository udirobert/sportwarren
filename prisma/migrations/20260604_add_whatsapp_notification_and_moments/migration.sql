-- Migration: add_whatsapp_notification_and_moments
-- PR 2: Notify service needs a cap table; moments service needs a row per
-- event so the in-app gallery has a single read model.

CREATE TABLE "whats_app_notifications" (
    "id"         TEXT NOT NULL,
    "twin_id"    TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "whats_app_notifications_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "whats_app_notifications_twin_id_created_at_idx"
  ON "whats_app_notifications"("twin_id", "created_at");

CREATE TABLE "moments" (
    "id"              TEXT NOT NULL,
    "subject_type"    TEXT NOT NULL,
    "subject_id"      TEXT NOT NULL,
    "kind"            TEXT NOT NULL,
    "tier"            TEXT NOT NULL,
    "label"           TEXT NOT NULL,
    "detail"          TEXT,
    "source_event_id" TEXT,
    "rendered_key"    TEXT,
    "rendered_at"     TIMESTAMP(3),
    "created_at"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "moments_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "moments_subject_type_subject_id_created_at_idx"
  ON "moments"("subject_type", "subject_id", "created_at");
