-- Add squad visibility + per-player discoverable + URL handle. The
-- privacy gradient (see AGENTS.md "Engagement rules" + docs/flywheel.md):
--   Squad.visibility: "private" | "group_only" | "public"
--     private    = only members see anything (default — kickabout intimacy)
--     group_only = roster visible, individual cards hidden, no scout indexing
--     public     = roster + cards visible, indexed by scouts, appears in discovery
--   User.discoverable: independent player-level opt-in for scout indexing.
--     A player can be discoverable even if their squad is private — own card,
--     own decision. The intersection of squad.visibility=public AND
--     user.discoverable=true is what scouts see in the public talent pool.
--   User.handle: unique URL slug for /player/{handle} public profile.

ALTER TABLE "squads" ADD COLUMN "visibility" TEXT NOT NULL DEFAULT 'private';
ALTER TABLE "users" ADD COLUMN "discoverable" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "users" ADD COLUMN "handle" TEXT;
CREATE UNIQUE INDEX "users_handle_key" ON "users"("handle");
