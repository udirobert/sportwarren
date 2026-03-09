ALTER TABLE squad_treasury
ADD COLUMN yellow_session_id TEXT;

ALTER TABLE transfer_offers
ADD COLUMN yellow_session_id TEXT;

ALTER TABLE matches
ADD COLUMN yellow_fee_session_id TEXT;
