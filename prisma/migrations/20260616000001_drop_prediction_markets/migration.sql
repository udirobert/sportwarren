-- Drop prediction-market tables. These were schema-only with no application
-- code referencing them. Removed as part of the consolidation pass that
-- realigns the product around match preservation rather than betting.

DROP TABLE IF EXISTS "prediction_bets";
DROP TABLE IF EXISTS "prediction_options";
DROP TABLE IF EXISTS "prediction_markets";
