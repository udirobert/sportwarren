-- Add attribute snapshot columns to sessions table
-- before_attributes: captured at session start by startSession()
-- after_attributes:  captured at session end by endSession()
-- Each stores { profileId: { pace: 55, shooting: 50, ... } }
-- so the analysis page can compute real before/after deltas.

ALTER TABLE sessions ADD COLUMN IF NOT EXISTS before_attributes JSONB;
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS after_attributes JSONB;
