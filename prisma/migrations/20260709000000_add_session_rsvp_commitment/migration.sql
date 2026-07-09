-- Peak-end commitment capture: RSVP fields on session_attendees.
-- status: 'in' | 'out' | 'maybe' — captured on the post-session payoff page.
-- committed_at: when they committed, so late-drops are visible.
ALTER TABLE session_attendees ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'in';
ALTER TABLE session_attendees ADD COLUMN IF NOT EXISTS committed_at TIMESTAMP(3);

-- Self-heal a known drift: migration 20260624000000 was edited after it was
-- applied, so some databases have before_attributes but never received
-- after_attributes. Idempotent re-add so the payoff/analysis flow (which
-- reads session.afterAttributes) works on every database.
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS after_attributes JSONB;
