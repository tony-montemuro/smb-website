DROP POLICY IF EXISTS "Insert restrictions [RESTRICTIVE]" ON submission;

CREATE POLICY "Insert restrictions [RESTRICTIVE]" 
ON submission
AS RESTRICTIVE 
FOR INSERT 
TO authenticated
WITH CHECK (
  (
    (id = now()) 
  AND
    CASE get_chart_type(game_id, level_id)
      WHEN 'both'::text THEN true
      WHEN 'score'::text THEN score
      WHEN 'time'::text THEN (NOT score)
      ELSE false
    END 
  AND
    valid_monkey_platform_region(game_id, monkey_id, platform_id, region_id)
  AND
    (submitted_at >= (SELECT release_date FROM game WHERE abb = game_id))
  )
);

ALTER TABLE submission
ALTER COLUMN proof TYPE varchar(256);

ALTER TABLE submission
ADD CONSTRAINT submission_proof_live_constraint CHECK (
  (proof = ''::text AND live = false) OR (proof <> ''::text AND live IN (true, false))
);

CREATE OR REPLACE FUNCTION prepare_submission() RETURNS "trigger"
LANGUAGE "plpgsql"
AS $$
  DECLARE
    negative_transform boolean;
    level_timer_type public.timer_t;
    old_submission_date timestamptz;
  BEGIN
    -- First, let's quickly validate that user is trying to insert a positive record. The value may be transformed to a negative
    -- value by this function, but should NEVER begin as negative
    IF NEW.record < 0 THEN
      RAISE EXCEPTION 'Record cannot be a negative value.';
    END IF;

    -- Store the time_ascending attribute for the level of the submission in the `negative_transform` variable, and the timer_type attribute for the level of the submission in the `level_timer_type` variable
    SELECT time_ascending, timer_type
    INTO negative_transform, level_timer_type
    FROM level l
    WHERE l.game = NEW.game_id AND l.name = NEW.level_id AND l.category = NEW.category;

    -- Store the submission date of the previous submission, if it exists
    SELECT submitted_at into old_submission_date
    FROM submission s
    WHERE (s.game_id = NEW.game_id AND
      s.level_id = NEW.level_id AND
      s.category = NEW.category AND
      s.profile_id = NEW.profile_id AND
      s.score = NEW.score AND
      s.tas = NEW.tas)
    ORDER BY submitted_at DESC
    LIMIT 1;

    -- If the submission is for a time chart, let's perform any necessary record modifications based on both the `negative_transform` and `level_timer_time`
    IF NOT new.score THEN

      -- Apply any transformations based on the `level_timer_type` variable
      IF NOT (level_timer_type IN ('sec_csec', 'min_sec_csec', 'hour_min_sec_csec')) THEN
        NEW.record := FLOOR(NEW.record); -- Round down to the nearest second
      END IF;
      IF level_timer_type IN ('min', 'hour', 'hour_min') THEN
        NEW.record := (FLOOR(NEW.record / 60)) * 60::float8; -- Round down to nearest minute
      END IF;
      IF level_timer_type = 'hour' THEN
        NEW.record := (FLOOR(NEW.record / 3600)) * 3600::float8; -- Round down to nearest hour
      END IF;

      -- Apply any transformations based on the `negative_transform` variable
      IF negative_transform THEN
        NEW.record := NEW.record * (-1); --negate the record attribute
      END IF;

    END IF;

    -- Next, let's update the submitted_at field, if necessary
    IF NEW.submitted_at = old_submission_date THEN
      NEW.submitted_at := NEW.submitted_at + interval '1 millisecond';
    END IF;

    -- Set the all_position in the submission table
    NEW.all_position := get_position(NEW, FALSE);

    -- Set the position in the submission table if live is true
    IF NEW.live = true THEN
      NEW.position := get_position(NEW, TRUE);
    ELSE
      NEW.position := null;
    END IF;

    RETURN NEW;
  END;
$$;