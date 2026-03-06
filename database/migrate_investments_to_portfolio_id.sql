-- Run this after confirming every investments row has a valid portfolio_id.
-- This finalizes the model: users -> portfolios -> investments.

ALTER TABLE investments
  ALTER COLUMN portfolio_id SET NOT NULL;

ALTER TABLE investments
  DROP COLUMN IF EXISTS member_id;
