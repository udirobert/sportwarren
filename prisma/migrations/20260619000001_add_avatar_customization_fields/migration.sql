-- Add illustrated avatar customization fields to users
ALTER TABLE "users" ADD COLUMN "avatar_kit_color" TEXT;
ALTER TABLE "users" ADD COLUMN "avatar_accent_color" TEXT;
ALTER TABLE "users" ADD COLUMN "avatar_skin_tone" TEXT;
ALTER TABLE "users" ADD COLUMN "avatar_hair_color" TEXT;
ALTER TABLE "users" ADD COLUMN "avatar_hair_style" TEXT;
ALTER TABLE "users" ADD COLUMN "avatar_number" TEXT;

-- Add kit branding fields to squads
ALTER TABLE "squads" ADD COLUMN "kit_color" TEXT;
ALTER TABLE "squads" ADD COLUMN "accent_color" TEXT;
