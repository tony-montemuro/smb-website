CREATE OR REPLACE FUNCTION get_chart_submissions(game text, category_name text, level text, is_score boolean) 
RETURNS json
LANGUAGE sql
AS $$
  WITH chart_submissions AS (
    SELECT *
    FROM submission s
    WHERE s.game_id = game AND s.category = category_name AND s.level_id = level AND s.score = is_score
  ),
  ranked_by_profile AS (
    SELECT cs.id, cs.record, cs.live, ROW_NUMBER() OVER (PARTITION BY cs.profile_id ORDER BY cs.submitted_at DESC, cs.id DESC) AS rn
    FROM chart_submissions cs
    WHERE cs.tas = false
  ),
  ranked AS (
    SELECT rbp.id
    FROM ranked_by_profile rbp
    WHERE rbp.rn = 1
  ),
  live_ranked AS (
    SELECT rbp.id, RANK() OVER (ORDER BY rbp.record DESC) AS "position"
    FROM ranked_by_profile rbp
    WHERE rbp.rn = 1 AND rbp.live = true
  ),
  ranked_by_profile_tas AS (
    SELECT cs.id, cs.record, cs.live, ROW_NUMBER() OVER (PARTITION BY cs.profile_id ORDER BY cs.submitted_at DESC) AS rn
    FROM chart_submissions cs
    WHERE cs.tas = true
  ),
  tas_ranked AS (
    SELECT rbpt.id
    FROM ranked_by_profile_tas rbpt
    WHERE rbpt.rn = 1
  )
  SELECT COALESCE((json_agg(row_to_json(chart_row))), '[]'::json)
  FROM (
    SELECT
      (SELECT jsonb_build_object('creator', jsonb_build_object('country', p.country, 'id', p.id, 'username', p.username)) FROM approve a INNER JOIN profile p ON a.creator_id = p.id WHERE a.submission_id = cs.id) AS "approve",
      cs.comment,
      cs.id,
      cs.live,
      CASE
        WHEN live_ranked.position = 3 THEN 'bronze'
        WHEN live_ranked.position = 2 THEN 'silver'
        WHEN live_ranked.position = 1 AND EXISTS (SELECT 1 FROM live_ranked lr WHERE lr.position = 1 AND lr.id <> live_ranked.id) THEN 'gold'
        WHEN live_ranked.position = 1 THEN 'platinum'
        ELSE NULL
      END as medal,
      (SELECT row_to_json(monkey_row) FROM (SELECT m.id, m.monkey_name FROM monkey m WHERE cs.monkey_id = m.id) AS monkey_row) monkey,
      CASE WHEN (ranked.id IS NULL AND tas_ranked.id IS NULL) THEN true ELSE false END AS obsolete,
      (SELECT row_to_json(platform_row) FROM (SELECT pl.id, pl.platform_abb, pl.platform_name FROM platform pl WHERE cs.platform_id = pl.id) AS platform_row) platform,
      (SELECT row_to_json(profile_row) FROM (SELECT pr.id, pr.username, pr.country FROM profile pr WHERE cs.profile_id = pr.id) AS profile_row) profile,
      cs.proof,
      cs.record,
      (SELECT row_to_json(region_row) FROM (SELECT rg.id, rg.region_name FROM region rg WHERE cs.region_id = rg.id) AS region_row) region,
      (SELECT row_to_json(report_row) FROM (SELECT rp.creator_id FROM report rp WHERE rp.submission_id = cs.id) AS report_row) report,
      cs.submitted_at,
      cs.tas
    FROM chart_submissions cs
    LEFT OUTER JOIN ranked ON cs.id = ranked.id
    LEFT OUTER JOIN live_ranked ON cs.id = live_ranked.id
    LEFT OUTER JOIN tas_ranked ON cs.id = tas_ranked.id
    ORDER BY cs.record DESC, cs.submitted_at ASC
  ) chart_row
$$;

CREATE OR REPLACE FUNCTION prepare_submission() RETURNS "trigger"
LANGUAGE "plpgsql"
AS $$
  DECLARE
    negative_transform boolean;
    level_timer_type public.timer_t;
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

CREATE OR REPLACE FUNCTION get_ranked_submissions(game_name text, category_name text, is_score boolean, live_only boolean)
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
    SELECT s.game_id, s.level_id, s.category, p.id, p.username, p.country, s.record, s.score, s.submitted_at, s.live, l.id AS level_ctr, ROW_NUMBER() OVER (PARTITION BY (s.profile_id, s.game_id, s.category, s.level_id, s.score, CASE WHEN live_only THEN s.live ELSE NULL END) ORDER BY s.submitted_at DESC, s.id DESC) AS rn
    FROM submission s
    INNER JOIN profile p ON s.profile_id = p.id
    INNER JOIN level l ON (s.game_id = l.game AND s.level_id = l.name AND s.category = l.category)  
    WHERE s.game_id = game_name AND s.category = category_name AND s.score = is_score AND tas = false AND (NOT live_only OR s.live = true)
  )
  SELECT r.game_id, r.level_id, r.category, r.id, r.username, r.country, r.record, r.submitted_at, r.live, RANK() OVER (PARTITION BY r.level_id ORDER BY r.record DESC) AS "position"
  FROM ranked r
  WHERE r.rn = 1
  ORDER BY r.level_ctr ASC, r.record DESC, r.submitted_at ASC
$$;