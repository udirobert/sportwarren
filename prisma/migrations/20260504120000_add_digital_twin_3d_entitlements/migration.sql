ALTER TABLE "squads"
  ADD COLUMN IF NOT EXISTS "digital_twin_3d_enabled" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "digital_twin_3d_tier" TEXT;
