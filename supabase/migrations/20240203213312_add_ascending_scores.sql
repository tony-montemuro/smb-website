ALTER TABLE level
ADD COLUMN score_ascending BOOLEAN NOT NULL DEFAULT false;

CREATE OR REPLACE FUNCTION prepare_submission() RETURNS "trigger"
LANGUAGE "plpgsql"
AS $$
  DECLARE
    time_negative_transform boolean;
    score_negative_transform boolean;
    level_timer_type public.timer_t;
  BEGIN
    -- First, let's quickly validate that user is trying to insert a positive record. The value may be transformed to a negative
    -- value by this function, but should NEVER begin as negative
    IF NEW.record < 0 THEN
      RAISE EXCEPTION 'Record cannot be a negative value.';
    END IF;

    -- time_ascending -> `time_negative_transform`, score_ascending -> `score_negative_transform`, timer_type -> `level_timer_type`
    SELECT time_ascending, score_ascending, timer_type
    INTO time_negative_transform, score_negative_transform, level_timer_type
    FROM level l
    WHERE l.game = NEW.game_id AND l.name = NEW.level_id AND l.category = NEW.category;

    -- If the submission is for a time chart, let's perform any necessary record modifications based on both the 
    -- `time_negative_transform` and `level_timer_time`
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

      -- Apply any transformations based on the `time_negative_transform` variable
      IF time_negative_transform THEN
        NEW.record := NEW.record * (-1); -- negate the record attribute
      END IF;

    -- Otherwise, let's perform any necessary record modifications based on the `score_negative_transform` variable
    ELSE
      IF score_negative_transform THEN
        NEW.record := NEW.record * (-1); -- negate the record attribute
      END IF;
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

UPDATE level
SET score_ascending = true
WHERE mode ILIKE '%golf%';