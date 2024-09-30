-- Create version table
CREATE TABLE version (
  id SERIAL PRIMARY KEY,
  game text NOT NULL,
  version VARCHAR(25) NOT NULL,
  sequence int NOT NULL,
  FOREIGN KEY (game) REFERENCES game,
  UNIQUE (game, version)
);

ALTER TABLE version
ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users"
ON version
TO public
USING (true);

ALTER TABLE submission
ADD COLUMN version INT
CONSTRAINT submission_version_fk REFERENCES version (id);

CREATE OR REPLACE PROCEDURE check_submission_version (game_id text, version_id int)
LANGUAGE "plpgsql"
AS $$
BEGIN
  -- If game has at least one "version", validate it. Otherwise, ensure the version is NULL.
  IF EXISTS (SELECT 1 FROM version WHERE game = game_id) THEN
    IF version_id IS NULL OR NOT EXISTS (SELECT 1 FROM version WHERE id = version_id AND game = game_id) THEN
      RAISE EXCEPTION 'Invalid version for this game.';
    END IF;
  ELSE
    IF version_id IS NOT NULL THEN
      RAISE EXCEPTION 'Version must be null for games without versions.';
    END IF;
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION prepare_submission() RETURNS "trigger"
LANGUAGE "plpgsql"
AS $$
  DECLARE
    negative_transform public.chart_t;
    level_timer_type public.timer_t;
  BEGIN
    -- First, let's just validate that version is valid
    CALL check_submission_version(NEW.game_id, NEW.version);

    -- Next, let's quickly validate that user is trying to insert a positive record. The value may be transformed to a negative
    -- value by this function, but should NEVER begin as negative
    IF NEW.record < 0 THEN
      RAISE EXCEPTION 'Record cannot be a negative value.';
    END IF;

    -- ascending -> `negative_transform`, timer_type -> `level_timer_type`
    SELECT ascending, timer_type
    INTO negative_transform, level_timer_type
    FROM level l
    WHERE l.game = NEW.game_id AND l.name = NEW.level_id AND l.category = NEW.category;

    -- If the submission is for a time chart, let's perform any necessary record modifications based on both the 
    -- `time_negative_transform` and `level_timer_time`
    IF NOT new.score THEN

      -- Apply any transformations based on the `level_timer_type` variable
      IF NOT (level_timer_type IN ('sec_csec', 'sec_msec', 'min_sec_csec', 'min_sec_msec', 'hour_min_sec_csec', 'hour_min_sec_msec')) THEN
        NEW.record := FLOOR(NEW.record); -- Round down to the nearest second
      END IF;
      IF level_timer_type IN ('min', 'hour', 'hour_min') THEN
        NEW.record := (FLOOR(NEW.record / 60)) * 60::float8; -- Round down to nearest minute
      END IF;
      IF level_timer_type = 'hour' THEN
        NEW.record := (FLOOR(NEW.record / 3600)) * 3600::float8; -- Round down to nearest hour
      END IF;

      -- Apply any transformations based on the `negative_transform` variable
      IF negative_transform IN ('time'::chart_t, 'both'::chart_t) THEN
        NEW.record := NEW.record * (-1); -- negate the record attribute
      END IF;

    -- Otherwise, let's perform any necessary record modifications based on the `negative_transform` variable
    ELSE
      IF negative_transform IN ('score'::chart_t, 'both'::chart_t) THEN
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

ALTER FUNCTION prepare_submission() RENAME TO prepare_submission_insert;

CREATE OR REPLACE FUNCTION prepare_submission_update() RETURNS "trigger"
LANGUAGE "plpgsql"
AS $$
  BEGIN
    CALL check_submission_version(NEW.game_id, NEW.version);

    RETURN NEW;
  END;
$$;

CREATE TRIGGER submission_before_update_row_trigger
BEFORE UPDATE ON submission
FOR EACH ROW EXECUTE FUNCTION prepare_submission_update();

-- New triggers for version table, to ensure data integrity
CREATE OR REPLACE FUNCTION validate_version_and_updatable_games()
RETURNS "trigger"
LANGUAGE "plpgsql" AS $$
  BEGIN
    -- Check if version with current sequence already exists
    IF EXISTS (SELECT 1 FROM version WHERE game = NEW.game AND sequence = NEW.sequence) THEN
      RAISE EXCEPTION 'Sequence % already exists for game %', NEW.sequence, NEW.game;
    END IF;

    -- Mark game as needing an update if it's the first new version
    IF NOT EXISTS (SELECT 1 FROM version WHERE game = NEW.game) THEN
      CREATE TEMPORARY TABLE IF NOT EXISTS updatable_games (
        game text PRIMARY KEY
      );

      INSERT INTO updatable_games (game)
      VALUES (NEW.game)
      ON CONFLICT DO NOTHING;
    END IF;

    RETURN NEW;
  END;
$$;

CREATE TRIGGER version_before_insert_row_trigger
BEFORE INSERT ON version
FOR EACH ROW EXECUTE FUNCTION validate_version_and_updatable_games();

CREATE OR REPLACE FUNCTION submission_version_cascade()
RETURNS "trigger"
LANGUAGE "plpgsql" AS $$
  BEGIN
    -- If we have any "updatable games", let's cascade most "recent" version to all relevant submissions
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_type = 'LOCAL TEMPORARY' AND table_name = 'updatable_games') THEN
      UPDATE submission
      SET version = v.id
      FROM version v
      JOIN updatable_games ug ON v.game = ug.game
      WHERE 
        submission.game_id = v.game AND
        submission.version IS NULL AND
        v.id IN (SELECT id FROM version WHERE game = v.game ORDER BY sequence DESC LIMIT 1);

      -- Destroy temporary table
      DROP TABLE IF EXISTS updatable_games;
    END IF;

    RETURN NEW;
  END;
$$;

CREATE TRIGGER version_after_insert_statement_trigger
AFTER INSERT ON version
FOR EACH STATEMENT EXECUTE FUNCTION submission_version_cascade();

-- Rename triggers to match new naming scheme
ALTER TRIGGER approve_after_insert_trigger ON approve RENAME TO approve_after_insert_row_trigger;
ALTER TRIGGER report_after_delete_trigger ON report RENAME TO report_after_delete_row_trigger;
ALTER TRIGGER report_after_insert_trigger ON report RENAME TO report_after_insert_row_trigger;
ALTER TRIGGER report_before_insert_trigger ON report RENAME TO report_before_insert_row_trigger;
ALTER TRIGGER submission_after_insert_trigger ON submission RENAME TO submission_after_insert_row_trigger;
ALTER TRIGGER submission_after_update_trigger ON submission RENAME TO submission_after_update_row_trigger;
ALTER TRIGGER submission_before_insert_trigger ON submission RENAME TO submission_before_insert_row_trigger;

-- Now, we need to update RPCs to allow for version specification

CREATE OR REPLACE FUNCTION get_ranked_submissions(game_name text, category_name text, is_score boolean, live_only boolean, version_key int)
RETURNS TABLE (
  game_id text,
  level_id text,
  category text,
  id integer,
  username varchar(25),
  country text,
  record float8,
  submitted_at timestamptz,
  live boolean,
  "position" integer
)
LANGUAGE sql
AS $$
  WITH ranked AS (
    SELECT 
      s.game_id, 
      s.level_id, 
      s.category, 
      p.id, 
      p.username, 
      p.country, 
      s.record, 
      s.score, 
      s.submitted_at, 
      s.live, 
      l.id AS level_ctr, 
      ROW_NUMBER() OVER (PARTITION BY (
        s.profile_id, 
        s.game_id, 
        s.category, 
        s.level_id, 
        s.score, 
        CASE WHEN live_only THEN s.live ELSE NULL END,
        CASE WHEN version_key IS NOT NULL THEN s.version ELSE NULL END
      ) ORDER BY s.submitted_at DESC, s.id DESC) AS rn
    FROM submission s
    INNER JOIN profile p ON s.profile_id = p.id
    INNER JOIN level l ON (
      s.game_id = l.game AND 
      s.level_id = l.name AND 
      s.category = l.category
    )  
    WHERE 
      s.game_id = game_name AND 
      s.category = category_name AND 
      s.score = is_score AND 
      tas = false AND 
      (NOT live_only OR s.live = true) AND
      (version_key IS NULL OR s.version = version_key)
  )
  SELECT 
    r.game_id, 
    r.level_id, 
    r.category, 
    r.id, 
    r.username, 
    r.country, 
    r.record, 
    r.submitted_at, 
    r.live, 
    RANK() OVER (PARTITION BY r.level_id ORDER BY r.record DESC) AS "position"
  FROM ranked r
  WHERE r.rn = 1
  ORDER BY r.level_ctr ASC, r.record DESC, r.submitted_at ASC
$$;

CREATE OR REPLACE FUNCTION get_medals(abb text, category text, score boolean, version int)
RETURNS json
LANGUAGE sql
AS $$
WITH ranked_submissions AS (
  SELECT
    level_id,
    id,
    username,
    country,
    "position"
  FROM get_ranked_submissions(abb, category, score, true, version)
),
medal_counts AS (
  SELECT
    id,
    username,
    country,
    COUNT(*) FILTER (WHERE "position" = 1 AND (SELECT COUNT(*) FROM ranked_submissions rs WHERE rs.level_id = ranked_submissions.level_id AND rs."position" = 1) = 1) AS platinum,
    COUNT(*) FILTER (WHERE "position" = 1 AND (SELECT COUNT(*) FROM ranked_submissions rs WHERE rs.level_id = ranked_submissions.level_id AND rs."position" = 1) > 1) AS gold,
    COUNT(*) FILTER (WHERE "position" = 2) AS silver,
    COUNT(*) FILTER (WHERE "position" = 3) AS bronze
  FROM ranked_submissions
  GROUP BY id, username, country
)
SELECT CASE WHEN category IN (SELECT abb FROM category WHERE practice = true) THEN COALESCE((json_agg(row_to_json(medals_row))), '[]'::json) ELSE '[]'::json END
FROM (
  SELECT
    (SELECT jsonb_build_object('country', mc.country, 'id', mc.id, 'username', mc.username)) AS profile,
    platinum,
    gold,
    silver,
    bronze,
    RANK() OVER (ORDER BY platinum DESC, gold DESC, silver DESC, bronze DESC) AS "position"
  FROM medal_counts mc
  ORDER BY platinum DESC, gold DESC, silver DESC, bronze DESC
) medals_row
$$;