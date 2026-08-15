-- The daily allowance of feature / bug requests, which mirrors pattern followed by `report_token`.
ALTER TABLE profile ADD COLUMN request_token integer DEFAULT 5 NOT NULL;

-- The guard which the profile UPDATE policy runs against the new column, a copy of `regulate_report_token`. Without it, a user
-- could hand themselves a fresh allowance through any profile update.
CREATE OR REPLACE FUNCTION regulate_request_token(request_token integer)
RETURNS boolean
LANGUAGE sql
AS $$WITH old AS (
  SELECT p.request_token
  FROM profile p
  WHERE (p.user_id = auth.uid())
)
SELECT (
  ((SELECT request_token FROM old) IS NOT DISTINCT FROM request_token)
OR
  ((SELECT request_token FROM old) > 0) AND (request_token = (SELECT request_token FROM old) - 1)
)$$;

ALTER POLICY "Enable update for authenticated users based on user ID" ON profile
WITH CHECK (
  auth.uid() = user_id
  AND regulate_report_token(report_token)
  AND regulate_request_token(request_token)
);

-- Spends a single request token, and reports what is left.
CREATE OR REPLACE FUNCTION consume_request_token()
RETURNS integer
LANGUAGE plpgsql
AS $$
DECLARE
  remaining integer;
BEGIN
  -- Administrators are exempt, and moderators are not: filing a request is not a game-specific moderation duty,
  -- which is a deliberate departure from `decrement_report_token`
  IF (is_admin()) THEN
    SELECT request_token INTO remaining
    FROM profile
    WHERE user_id = auth.uid();

    RETURN remaining;
  END IF;

  -- One statement, so the check and the spend cannot race
  UPDATE profile
  SET request_token = request_token - 1
  WHERE user_id = auth.uid() AND request_token > 0
  RETURNING request_token INTO remaining;

  -- NULL, rather than an exception, when the allowance is spent: the caller is an http handler, which has to tell an empty
  -- allowance apart from a broken database without matching on an error string
  RETURN remaining;
END;
$$;

-- Both allowances reset together, on the schedule the report tokens already used
SELECT cron.unschedule('Reset report tokens');

SELECT cron.schedule(
    'Reset daily tokens',
    '0 0 * * *',
    $$
        UPDATE profile
        SET report_token = 10, request_token = 5
    $$
);
