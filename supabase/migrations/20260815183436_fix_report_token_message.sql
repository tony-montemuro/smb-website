-- Replaces `decrement_report_token` to correct the grammar of the exception it raises, and nothing else. The body is otherwise
-- the baseline definition, verbatim.
CREATE OR REPLACE FUNCTION decrement_report_token()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  reported_submission submission%ROWTYPE;
BEGIN
  -- First, fetch reported submission data using the `submission_id` field
  SELECT *
  FROM submission
  INTO reported_submission
  WHERE id = NEW.submission_id;

  -- This function will only do something if
  -- 1.) User is normal (not moderator / administrator)
  -- 2.) Creator of report differs from owner of submission
  IF (NOT (is_moderator(reported_submission.game_id)) AND NEW.creator_id <> reported_submission.profile_id) THEN
    -- Check if the profile has greater than 0 report tokens
    IF (SELECT report_token FROM profile WHERE user_id = auth.uid()) <= 0 THEN
      RAISE EXCEPTION 'You have run out of reports for the day. Try again tomorrow.';
    END IF;

    -- Decrement the report_token
    UPDATE profile
    SET report_token = report_token - 1
    WHERE user_id = auth.uid();
  END IF;

  RETURN NEW;
END;
$$;
