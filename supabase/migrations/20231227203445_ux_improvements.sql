ALTER TABLE notification
DROP CONSTRAINT notification_level_fk,
ADD CONSTRAINT notification_level_fk
FOREIGN KEY (game_id, level_id, category)
REFERENCES level (game, name, category) MATCH FULL
ON UPDATE CASCADE;

ALTER TABLE submission
DROP CONSTRAINT submission_level_fk,
ADD CONSTRAINT submission_level_fk
FOREIGN KEY (game_id, level_id, category)
REFERENCES level (game, name, category) MATCH FULL
ON UPDATE CASCADE;

UPDATE level
SET name = REPLACE(name, '?', '%3F')
WHERE name LIKE '%?%';

DROP POLICY "Report insert restrictions for authenticated users" 
ON report;

CREATE POLICY "Enable insert for authenticated users" 
ON report 
FOR INSERT 
TO authenticated 
WITH CHECK (creator_id = get_profile_id());

CREATE POLICY "Enable delete for administrators" 
ON report
FOR DELETE
TO authenticated
USING (is_admin());

CREATE OR REPLACE FUNCTION decrement_report_token() 
RETURNS TRIGGER
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
      RAISE EXCEPTION 'You have ran out of reports for the day. Try again tomorrow.';
    END IF;

    -- Decrement the report_token
    UPDATE profile
    SET report_token = report_token - 1
    WHERE user_id = auth.uid();
  END IF;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION insert_notify_and_unapprove() 
RETURNS trigger
LANGUAGE plpgsql
AS $$
  DECLARE
    reported_submission submission%ROWTYPE;
    current_id int4;
    user_id_for_notif uuid;
  BEGIN
    -- first, we need to get the submission data based on NEW.submission_id
    SELECT *
    FROM submission
    INTO reported_submission
    WHERE id = NEW.submission_id;

    -- next, let's verify that the submission's profile is authenticated
    SELECT user_id into user_id_for_notif
    FROM profile
    WHERE id = reported_submission.profile_id;

    -- if the submission being updated belongs to an authenticated user, we need to send a REPORT notification
    IF user_id_for_notif IS NOT NULL then
      -- now, get the profile id of the user who created report; we should only notify if current_id <> reported_submission.profile_id
      current_id := get_profile_id();
      IF current_id <> reported_submission.profile_id THEN
        INSERT INTO notification (submission_id, game_id, level_id, category, score, tas, record, profile_id, creator_id, notif_type, message, report_id)
        VALUES (NEW.submission_id, reported_submission.game_id, reported_submission.level_id, reported_submission.category, reported_submission.score, reported_submission.tas, reported_submission.record, reported_submission.profile_id, current_id, 'report', NEW.message, NEW.report_date);
      END IF;
    END IF;
    
    -- finally, let's unapprove the submission, if it was approved
    DELETE from approve
    WHERE submission_id = NEW.submission_id;

    RETURN NEW;
  END;
$$;

CREATE OR REPLACE FUNCTION get_reported(abb text)
RETURNS json
LANGUAGE sql
AS $$
  SELECT COALESCE((json_agg(row_to_json(submissions_row))), '[]'::json)
  FROM (
    SELECT
      s.all_position,
      s.comment,
      s.id,
      (SELECT jsonb_build_object('category', l.category, 'name', l.name, 'timer_type', l.timer_type, 'mode', jsonb_build_object('game', jsonb_build_object('abb', g.abb, 'name', g.name))) FROM level l INNER JOIN mode m ON l.game = m.game AND l.mode = m.name AND l.category = m.category INNER JOIN game g ON m.game = g.abb WHERE l.game = s.game_id AND l.name = s.level_id AND l.category = s.category) AS "level",
      s.live,
      (SELECT row_to_json(monkey_row) FROM (SELECT m.id, m.monkey_name FROM monkey m WHERE m.id = s.monkey_id) AS monkey_row) monkey,
      (SELECT row_to_json(platform_row) FROM (SELECT pl.id, pl.platform_name FROM platform pl WHERE pl.id = s.platform_id) AS platform_row) platform,
      s.position,
      (SELECT row_to_json(profile_row) FROM (SELECT pr.country, pr.id, pr.username FROM profile pr WHERE pr.id = s.profile_id) AS profile_row) profile,
      (SELECT row_to_json(region_row) FROM (SELECT rg.id, rg.region_name FROM region rg WHERE rg.id = s.region_id) AS region_row) region,
      (SELECT jsonb_build_object('creator', jsonb_build_object('country', p.country, 'id', p.id, 'username', p.username), 'message', r.message, 'report_date', r.report_date)) AS "report",
      s.proof,
      s.record,
      s.score,
      s.submitted_at,
      s.tas
    FROM submission s
    INNER JOIN report r ON r.submission_id = s.id
    INNER JOIN profile p ON p.id = r.creator_id
    ORDER BY r.report_date
  ) submissions_row
$$;