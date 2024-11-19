-- Create version table
CREATE TABLE version (
  id SERIAL PRIMARY KEY,
  game text NOT NULL,
  version VARCHAR(10) NOT NULL,
  sequence int NOT NULL,
  FOREIGN KEY (game) REFERENCES game,
  UNIQUE (game, version)
);

ALTER TABLE version
ADD CONSTRAINT version_version_constraint
CHECK (version ~ '^[a-zA-Z0-9][a-zA-Z0-9.]{0,9}$'::text);

ALTER TABLE version
ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users"
ON version
TO public
USING (true);

ALTER TABLE submission
ADD COLUMN version INT
CONSTRAINT submission_version_fk REFERENCES version (id);

GRANT UPDATE("version") ON TABLE submission TO "authenticated";

-- Add version attribute to notification
ALTER TABLE notification
ADD COLUMN version_id INT;

ALTER TABLE notification
ADD CONSTRAINT notification_version_id_fkey
FOREIGN KEY (version_id) REFERENCES version (id);

-- Update RLS for notification table
DROP POLICY "Enable restricted insert access for users" ON notification;
CREATE POLICY "Enable restricted insert access for users" 
ON "notification" 
FOR INSERT 
TO authenticated 
WITH CHECK (
  (
    (notif_type = 'report'::notif_t)
  AND
    EXISTS (
      SELECT 1
      FROM submission
      WHERE (
        submission.id = notification.submission_id AND 
        submission.game_id = notification.game_id AND 
        submission.level_id = notification.level_id AND 
        submission.category = notification.category AND 
        submission.score = notification.score AND
        submission.tas = notification.tas AND
        submission.record = notification.record AND
        submission.profile_id = notification.profile_id AND
        submission.version = notification.version_id
      )
    )
  AND 
    (
      EXISTS (
        SELECT 1
        FROM report
        WHERE ((report.submission_id = notification.submission_id) AND (report.message = notification.message) AND (report.creator_id = notification.creator_id))
      )
    )
  AND
    (
      NOT (is_already_notified(report_id))
    )
  )
);

-- Create new procedure for submission writes
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

-- Also, update `get_position` function
CREATE OR REPLACE FUNCTION "public"."get_position"("newrecord" "public"."submission", "liveonly" boolean) RETURNS integer
  LANGUAGE "plpgsql"
  AS $$
DECLARE
  submissions CURSOR FOR
    SELECT s2.record
    FROM submission s2
    JOIN (
      SELECT profile_id, MAX(submitted_at) AS max_submitted_at
      FROM submission
      WHERE game_id = newRecord.game_id
        AND level_id = newRecord.level_id
        AND category = newRecord.category
        AND score = newRecord.score
        AND profile_id <> (get_profile_id())
        AND tas = newRecord.tas
        AND (NOT liveOnly OR live = TRUE)
        AND (newRecord.version IS NULL OR version = newRecord.version)
      GROUP BY profile_id
    ) latest_submissions ON s2.profile_id = latest_submissions.profile_id AND s2.submitted_at = latest_submissions.max_submitted_at
    WHERE game_id = newRecord.game_id
      AND level_id = newRecord.level_id
      AND category = newRecord.category
      AND score = newRecord.score
      AND s2.profile_id <> (get_profile_id())
      AND tas = newRecord.tas
      AND (NOT liveOnly OR live = TRUE)
      AND (newRecord.version IS NULL OR version = newRecord.version)
    ORDER BY s2.record DESC;

  prevRecord FLOAT8 := 1.7976931348623157E308;
  trueCount INTEGER := 1;
  posCount INTEGER := 1;
BEGIN
  FOR submission IN submissions LOOP
    -- If current record is less than previous record, update posCount
    IF submission.record < prevRecord THEN
      posCount := trueCount;
    END IF;

    -- If current record is less than or equal, then return posCount
    IF submission.record <= newRecord.record THEN
      RETURN posCount;
    END IF;

    -- update trueCount and prevRecord
    trueCount := trueCount + 1;
    prevRecord := submission.record;

  END LOOP;

  -- If the loop completes, just return trueCount
  RETURN trueCount;
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

-- Create new trigger that activates before submission update
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

-- Update function that activates after submission update
CREATE OR REPLACE FUNCTION "public"."update_notify_and_unapprove"() RETURNS "trigger"
  LANGUAGE "plpgsql"
  AS $$
DECLARE
  changed_columns text[];
  current_id int4;
  user_id_for_notif uuid;
  submission_data record;
  row_count int;
BEGIN
  -- Get the profile id of the user performing the UPDATE
  current_id := get_profile_id();

  -- Count the number of affected rows by the UPDATE that caused this trigger
  SELECT COUNT(*) INTO row_count FROM new_table;

  -- Iterate over affected rows
  FOR submission_data IN 
    SELECT 
      nt.*,
      ot.tas AS old_tas,
      ot.submitted_at AS old_submitted_at,
      ot.monkey_id AS old_monkey_id,
      ot.platform_id AS old_platform_id,
      ot.region_id AS old_region_id,
      ot.proof AS old_proof,
      ot.comment AS old_comment,
      ot.live AS old_live,
      ot.mod_note AS old_mod_note,
      ot.version AS old_version
    FROM new_table nt
    JOIN old_table ot ON nt.id = ot.id 
  LOOP
    -- Determine which updatable columns have changed
    SELECT array_agg(o.key)
    INTO changed_columns
    FROM jsonb_each_text(
      jsonb_build_object(
        'tas', submission_data.tas,
        'submitted_at', submission_data.submitted_at,
        'monkey_id', submission_data.monkey_id,
        'platform_id', submission_data.platform_id,
        'region_id', submission_data.region_id,
        'proof', submission_data.proof,
        'comment', submission_data.comment,
        'live', submission_data.live,
        'mod_note', submission_data.mod_note,
        'version', submission_data.version
      )
    ) AS o
    CROSS JOIN jsonb_each_text(
      jsonb_build_object(
        'tas', submission_data.old_tas,
        'submitted_at', submission_data.old_submitted_at,
        'monkey_id', submission_data.old_monkey_id,
        'platform_id', submission_data.old_platform_id,
        'region_id', submission_data.old_region_id,
        'proof', submission_data.old_proof,
        'comment', submission_data.old_comment,
        'live', submission_data.old_live,
        'mod_note', submission_data.old_mod_note,
        'version', submission_data.old_version
      )
    ) AS n
    WHERE o.key = n.key AND o.value IS DISTINCT FROM n.value;

    -- If only `level_id` has changed, let continue
    IF changed_columns = ARRAY['level_id'] THEN
      CONTINUE;
    END IF;

    -- Next, let's fetch submission's profile's `user_id`
    SELECT user_id into user_id_for_notif
    FROM profile
    WHERE id = submission_data.profile_id;

    -- If we are performing a bulk update on a set of submissions, the only column changed is `version`, and the current
    -- user is an admin, we can assume the user is adding a new version. In this case, we can ignore notifications, unapprovals, etc.
    IF (
      row_count > 1 AND
      changed_columns = ARRAY['version'] AND
      is_admin()
    ) THEN
      CONTINUE;
    END IF;

    -- if the submission being updated belongs to an authenticated user, AND the profile_id is not the same as the current_id, we need to send an UPDATE notification
    IF user_id_for_notif IS NOT NULL AND submission_data.profile_id <> current_id then
      INSERT INTO notification (
        submission_id,
        game_id,
        level_id,
        category,
        score,
        record,
        profile_id,
        creator_id,
        notif_type,
        tas,
        submitted_at,
        region_id,
        monkey_id,
        platform_id,
        proof,
        live,
        comment,
        mod_note,
        version_id
      )
      VALUES (
        submission_data.id,
        submission_data.game_id,
        submission_data.level_id,
        submission_data.category,
        submission_data.score,
        submission_data.record,
        submission_data.profile_id,
        current_id,
        'update',
        submission_data.old_tas,
        submission_data.old_submitted_at,
        submission_data.old_region_id,
        submission_data.old_monkey_id,
        submission_data.old_platform_id,
        submission_data.old_proof,
        submission_data.old_live,
        submission_data.old_comment,
        submission_data.old_mod_note,
        submission_data.old_version
      );
    END IF;
    
    -- next, let's delete any approval of the submission, if there is one
    DELETE from approve
    WHERE submission_id = submission_data.id;
  END LOOP;

  RETURN NULL;
END;
$$;

-- Recreate trigger, but make it STATEMENT this time.
DROP TRIGGER IF EXISTS submission_after_update_trigger ON submission;

CREATE TRIGGER submission_after_update_statement_trigger 
AFTER UPDATE ON submission 
REFERENCING NEW TABLE AS new_table OLD TABLE AS old_table
FOR EACH STATEMENT EXECUTE FUNCTION update_notify_and_unapprove();

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
    -- If we have any "updatable games", let's cascade least "recent" version to all relevant submissions
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_type = 'LOCAL TEMPORARY' AND table_name = 'updatable_games') THEN
      UPDATE submission s
      SET version = v.id
      FROM version v
      JOIN updatable_games ug ON v.game = ug.game
      WHERE 
        s.game_id = v.game AND
        s.version IS NULL AND
        v.id IN (SELECT id FROM version WHERE game = v.game ORDER BY sequence ASC LIMIT 1);

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
ALTER TRIGGER submission_before_insert_trigger ON submission RENAME TO submission_before_insert_row_trigger;

-- Now, we need to update RPCs to allow for version specification

-- First, `get_ranked_submissions`. Many relevant RPCs depend on this.
DROP FUNCTION get_ranked_submissions(text, text, boolean, boolean);
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

-- Next, medals RPC.
DROP FUNCTION get_medals(text, text, boolean);
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

-- Next, totals RPC.
DROP FUNCTION get_totals(text, text, boolean, boolean);
CREATE OR REPLACE FUNCTION get_totals(abb text, category text, score boolean, live_only boolean, version int)
RETURNS json
LANGUAGE plv8
AS $$
  // -- first, this code should only really execute for "practice mode" categories, should return an empty array otherwise
  const practiceCategories = plv8.execute( 'SELECT abb FROM category WHERE practice = true' );
  if (!practiceCategories.some(item => item.abb === category)) {
    return [];
  }

  // -- next, get the ranked submissions according to the function parameters
  let query = 'SELECT * FROM get_ranked_submissions($1, $2, $3, $4, $5)';
  let paramTypes = ['text', 'text', 'boolean', 'boolean', 'int'];
  let plan = plv8.prepare(query, paramTypes);
  const submissions = plan.execute( [abb, category, score, live_only, version] );
  plan.free();

  // -- next, get the total time. note: this is only necessary to define if `score` is FALSE
  let totalTime;
  if (!score) {
    query = 'SELECT get_category_time($1, $2)';
    paramTypes = ['text', 'text'];
    plan = plv8.prepare(query, paramTypes);
    result = plan.execute( [abb, category] );
    totalTime = result[0].get_category_time;
    plan.free();
  }

  // -- next, we want to create our mapping of users to totals
  const userToTotal = {};
  submissions.forEach(submission => {

    // -- first, extract information from submission object
    const profile = { 
      id: submission.id,
      username: submission.username,
      country: submission.country
    };
    const record = score ? submission.record : -Math.abs(submission.record);

    // -- then, we can update the mapping object
    // -- default case: user has already been added to mapping. simple increment the total field
    if (profile.id in userToTotal) {
      userToTotal[profile.id].total += record
    } 
    
    // -- edge case: user has not yet been added to the mapping. add them, as well as the record (or sum of `totalTime` and `record`) as total
    else {
      userToTotal[profile.id] = { profile: profile, total: score ? record : totalTime + record };
    }

  });

  // -- now, let's convert our mapping into an array of objects, sorted by `total`. NOTE: order of sort depends on the `score` parameter
  let totals;
  if (score) {
    totals = Object.values(userToTotal).sort((a, b) => a.total > b.total ? -1 : 1);
  } else {
    totals = Object.values(userToTotal).sort((a, b) => a.total > b.total ? 1 : -1);
  }

  // -- now, let's add the position attribute
  let trueCount = 1, posCount = trueCount;
  totals.forEach((row, index) => {
    row.position = posCount;
    trueCount++;
    
    // -- if next element exists, and has a different total than the current total, update posCount
    if (index < totals.length-1 && totals[index+1].total !== row.total) {
      posCount = trueCount;
    }
  });

  // -- finally, return our totals array of objects
  return totals;
$$;

-- Next, get_records_submissions RPC, a dependency of records RPC.
DROP FUNCTION get_record_submissions(text, text, boolean, boolean);
CREATE OR REPLACE FUNCTION get_record_submissions(game_name text, category_name text, is_score boolean, live_only boolean, version_key int default null)
RETURNS TABLE (
  id timestamptz,
  game_id text,
  level_id text,
  category text,
  profile_id integer,
  username varchar(25),
  country text,
  record float8,
  submitted_at timestamptz,
  live boolean
)
LANGUAGE sql
AS $$
  WITH ranked AS (
    SELECT 
      s.id,
      s.game_id, 
      s.level_id, 
      s.category, 
      p.id AS profile_id, 
      p.username, 
      p.country, 
      s.record, 
      s.score, 
      s.submitted_at, 
      s.live, 
      l.id AS level_ctr, 
      RANK() OVER (
        PARTITION BY (
          s.game_id, 
          s.category, 
          s.level_id, 
          s.score, 
          CASE WHEN live_only THEN s.live ELSE NULL END,
          CASE WHEN version_key IS NOT NULL THEN s.version ELSE NULL END
        ) 
        ORDER BY s.record DESC
      ) AS rn
    FROM submission s
    INNER JOIN profile p ON s.profile_id = p.id
    INNER JOIN level l ON (s.game_id = l.game AND s.level_id = l.name AND s.category = l.category)  
    WHERE 
      s.game_id = game_name
      AND s.category = category_name
      AND s.score = is_score
      AND tas = false
      AND (NOT live_only OR s.live = true)
      AND (version_key IS NULL OR s.version = version_key)
  )
  SELECT r.id, r.game_id, r.level_id, r.category, r.profile_id, r.username, r.country, r.record, r.submitted_at, r.live
  FROM ranked r
  WHERE r.rn = 1
  ORDER BY r.level_ctr ASC, r.record DESC, r.submitted_at ASC
$$;

-- Next, records RPC.
DROP FUNCTION get_records(text, text, boolean, boolean);
CREATE OR REPLACE FUNCTION get_records(abb text, category text, score boolean, live_only boolean, version int)
RETURNS json
LANGUAGE plv8
AS $$
  // -- first, get the record submissions according to the function parameters
  let query = 'SELECT * FROM get_record_submissions($1, $2, $3, $4, $5)';
  let paramTypes = ['text', 'text', 'boolean', 'boolean', 'int'];
  let plan = plv8.prepare(query, paramTypes);
  const submissions = plan.execute( [abb, category, score, live_only, version] );
  plan.free();

  // -- next, get the list of modes for the (abb, category, score) combination
  query = 'SELECT get_category_levels_by_mode($1, $2, $3)';
  paramTypes = ['text', 'text', 'boolean'];
  plan = plv8.prepare(query, paramTypes);
  const result = plan.execute( [abb, category, score] );
  const modes = JSON.parse(result[0].get_category_levels_by_mode);
  plan.free();

  // -- initialize variables used to generate record table
  const recordTable = {};
  let index = 0;

  // -- now, let's populate the record table
  modes.forEach(mode => {
    const modeRecords = []; // -- store the array of record objects for each level in the mode
    mode.levels.forEach(level => {

      // -- create default record object
      const recordObj = {
        level: level,
        profiles: [],
        record: null
      };

      // -- loop through all submissions for the current level
      while (index < submissions.length && submissions[index].level_id === level.name) {
        const submission = submissions[index];
        const profile = { 
          country: submission.country, 
          id: submission.profile_id, 
          username: submission.username,
          submission_id: submission.id 
        };
        recordObj.record = submission.record;

        if (!recordObj.profiles.some(p => p.id === profile.id)) {
          recordObj.profiles.push(profile);
        }
        index++;
      }
      modeRecords.push(recordObj);
    });
    
    // -- once we have gone through each level in the current mode, update the record table
    recordTable[mode.name] = modeRecords;
  });

  // -- finally, return record table
  return recordTable;
$$;

-- Next, level board RPC.
DROP FUNCTION get_chart_submissions(text, text, text, boolean);
CREATE OR REPLACE FUNCTION get_chart_submissions(game text, category_name text, level text, is_score boolean, version_key int) 
RETURNS json
LANGUAGE sql
AS $$
  WITH chart_submissions AS (
    SELECT *
    FROM submission s
    WHERE s.game_id = game AND s.category = category_name AND s.level_id = level AND s.score = is_score AND (CASE WHEN version IS NOT NULL THEN version = version_key ELSE true END)
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
      cs.mod_note,
      (SELECT row_to_json(monkey_row) FROM (SELECT m.id, m.monkey_name FROM monkey m WHERE cs.monkey_id = m.id) AS monkey_row) monkey,
      CASE WHEN (ranked.id IS NULL AND tas_ranked.id IS NULL) THEN true ELSE false END AS obsolete,
      (SELECT row_to_json(platform_row) FROM (SELECT pl.id, pl.platform_abb, pl.platform_name FROM platform pl WHERE cs.platform_id = pl.id) AS platform_row) platform,
      (SELECT row_to_json(profile_row) FROM (SELECT pr.id, pr.username, pr.country FROM profile pr WHERE cs.profile_id = pr.id) AS profile_row) profile,
      cs.proof,
      cs.record,
      (SELECT row_to_json(region_row) FROM (SELECT rg.id, rg.region_name FROM region rg WHERE cs.region_id = rg.id) AS region_row) region,
      (SELECT row_to_json(report_row) FROM (SELECT rp.creator_id FROM report rp WHERE rp.submission_id = cs.id) AS report_row) report,
      cs.submitted_at,
      cs.tas,
      cs.version
    FROM chart_submissions cs
    LEFT OUTER JOIN ranked ON cs.id = ranked.id
    LEFT OUTER JOIN live_ranked ON cs.id = live_ranked.id
    LEFT OUTER JOIN tas_ranked ON cs.id = tas_ranked.id
    ORDER BY cs.record DESC, cs.submitted_at ASC
  ) chart_row
$$;

-- Next, get profile RPC.
CREATE OR REPLACE FUNCTION get_profile(p_id integer)
RETURNS json
LANGUAGE sql
AS $$
  SELECT row_to_json(profiles_row)
  FROM (
    SELECT
      EXISTS (SELECT 1 FROM administrator a WHERE a.profile_id = p_id) AS administrator,
      bio,
      birthday,
      (SELECT row_to_json(country_row) FROM (SELECT c.iso2, c.name FROM countries c WHERE c.iso2 = p.country) AS country_row) country,
      discord,
      featured_video,
      id,
      (
        SELECT COALESCE ((json_agg(jsonb_build_object(
          'abb', g.abb,
          'custom', g.custom,
          'name', g.name
        ) ORDER BY g.release_date)), '[]'::json)
        FROM (
          SELECT g.abb, g.custom, g.release_date, g.name
          FROM game_profile gp
          INNER JOIN game AS g ON g.abb = gp.game
          WHERE gp.profile = p_id
          ORDER BY g.release_date
        ) g
      ) moderated_games,
      (
        SELECT COALESCE (json_agg(jsonb_build_object(
          'abb', g.abb,
          'categories', (
            SELECT json_agg(jsonb_build_object(
              'abb', c.category,
              'types', (
                SELECT json_agg(DISTINCT l.chart_type)
                FROM level l
                WHERE l.game = g.abb AND l.category = c.category
              )
            ))
            FROM (
              SELECT * FROM (
                SELECT DISTINCT ON (m.category) m.category, m.id
                FROM mode m
                WHERE m.game = g.abb
                ORDER BY m.category, m.id
              ) dc ORDER BY dc.id
            ) c
          ),
          'custom', g.custom,
          'live_preference', g.live_preference,
          'name', g.name,
          'versions', (
            SELECT json_agg(jsonb_build_object(
              'id', v.id,
              'version', v.version,
              'sequence', v.sequence 
            ))
            FROM version v
            WHERE v.game = g.abb
          )
        ) ORDER BY g.release_date), '[]'::json) AS submitted_games
        FROM (
          SELECT DISTINCT ON (s.game_id) s.game_id AS abb, g.custom, g.release_date, g.live_preference, g.name
          FROM submission s
          INNER JOIN game AS g ON g.abb = s.game_id
          WHERE s.profile_id = p_id
        ) g
      ) submitted_games,
      twitch_username,
      twitter_handle,
      username,
      video_description,
      youtube_handle
    FROM profile p
    WHERE p.id = p_id
  ) profiles_row
$$;

-- Next, get user rankings RPC.
DROP FUNCTION IF EXISTS get_user_rankings(text, text, boolean, boolean, integer);
CREATE FUNCTION get_user_rankings(abb text, category text, score boolean, live_only boolean, profile_id int, version_key int)
RETURNS json
LANGUAGE plv8
AS $$
  // -- first, get the ranked submissions according to the function parameters
  let query = 'SELECT * FROM get_ranked_submissions($1, $2, $3, $4, $5)';
  let paramTypes = ['text', 'text', 'boolean', 'boolean', 'int'];
  let plan = plv8.prepare(query, paramTypes);
  const submissions = plan.execute( [abb, category, score, live_only, version_key] );
  plan.free();

  // -- next, get the list of modes for the abb, category, score combination
  query = 'SELECT get_category_levels_by_mode($1, $2, $3)';
  paramTypes = ['text', 'text', 'boolean'];
  plan = plv8.prepare(query, paramTypes);
  const result = plan.execute( [abb, category, score] );
  const modes = JSON.parse(result[0].get_category_levels_by_mode);
  plan.free();

  // -- initialize variables used to generate the rankings
  const rankings = {};
  let index = 0;

  // -- now, let's populate the rankings object
  modes.forEach(mode => {
    const modeRecords = []; // -- store the array of record objects for each level in the mode
    mode.levels.forEach(level => {

      // -- create default record object
      const recordObj = {
        level: level,
        record: null,
        date: null,
        position: null
      };

      // -- loop through all submissions for the current level
      while (index < submissions.length && submissions[index].level_id === level.name) {

        // -- if current submission has id of `profile_id`, it is the user's submission. thus, we need to update record object
        const submission = submissions[index];
        if (submission.id === profile_id) {
          recordObj.record = submission.record;
          recordObj.date = submission.submitted_at;
          recordObj.position = submission.position;
        }
        index++;
      }
      modeRecords.push(recordObj);
    });
    
    // -- once we have gone through each level in the current mode, update the rankings object
    rankings[mode.name] = modeRecords;
  });

  // -- finally, return rankings
  return rankings;
$$;

-- Next, get unapproved counts RPC
CREATE OR REPLACE FUNCTION get_unapproved_counts(abbs text[])
RETURNS json
LANGUAGE sql
AS $$
  SELECT json_agg(row_to_json(submission_row))
  FROM (
    SELECT 
      g.abb AS abb,
      g.min_date,
      (
        SELECT json_agg(monkey_row)
        FROM (
          SELECT m.id, m.monkey_name
          FROM game_monkey gm
          INNER JOIN monkey m ON gm.monkey = m.id
          WHERE gm.game = g.abb
          ORDER BY gm.id
        ) monkey_row
      ) AS monkey,
      g.name,
       (
        SELECT json_agg(platform_row)
        FROM (
          SELECT p.id, p.platform_name
          FROM game_platform gp
          INNER JOIN platform p ON gp.platform = p.id
          WHERE gp.game = g.abb
          ORDER BY gp.id
        ) platform_row
      ) AS platform,
      (
        SELECT json_agg(region_row)
        FROM (
          SELECT r.id, r.region_name
          FROM game_region gr
          INNER JOIN region r ON gr.region = r.id
          WHERE gr.game = g.abb
          ORDER BY gr.id
        ) region_row
      ) AS region,
      g.release_date,
      COUNT(CASE WHEN s.id IS NOT NULL AND a.submission_id IS NULL AND r.submission_id IS NOT NULL THEN 1 ELSE NULL END) AS reported,
      COUNT(CASE WHEN s.id IS NOT NULL AND a.submission_id IS NULL AND r.submission_id IS NULL THEN 1 ELSE NULL END) AS unapproved,
      (
        SELECT COALESCE(json_agg(version_row), '[]'::json)
        FROM (
          SELECT v.id, v.version, v.sequence
          FROM version v
          WHERE v.game = g.abb
          ORDER BY v.sequence
        ) version_row
      ) AS version
    FROM game g
    LEFT JOIN submission s ON g.abb = s.game_id
    LEFT JOIN approve a ON s.id = a.submission_id
    LEFT JOIN report r ON s.id = r.submission_id
    WHERE
      CASE
        WHEN array_length(abbs, 1) > 0 THEN g.abb = ANY(abbs)
        ELSE true
      END
    GROUP BY g.abb
    ORDER BY g.release_date
  ) submission_row
$$;

-- Next, get unapproved RPC
CREATE OR REPLACE FUNCTION get_unapproved(abb text)
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
      s.mod_note,
      (SELECT row_to_json(monkey_row) FROM (SELECT m.id, m.monkey_name FROM monkey m WHERE m.id = s.monkey_id) AS monkey_row) monkey,
      (SELECT row_to_json(platform_row) FROM (SELECT pl.id, pl.platform_name FROM platform pl WHERE pl.id = s.platform_id) AS platform_row) platform,
      s.position,
      (SELECT row_to_json(profile_row) FROM (SELECT pr.country, pr.id, pr.username FROM profile pr WHERE pr.id = s.profile_id) AS profile_row) profile,
      (SELECT row_to_json(region_row) FROM (SELECT rg.id, rg.region_name FROM region rg WHERE rg.id = s.region_id) AS region_row) region,
      s.proof,
      s.record,
      s.score,
      s.submitted_at,
      s.tas,
      (SELECT row_to_json(version_row) FROM (SELECT v.id, v.version, v.sequence FROM version v WHERE v.id = s.version) AS version_row) version
    FROM submission s
    LEFT OUTER JOIN approve a ON a.submission_id = s.id
    LEFT OUTER JOIN report r ON r.submission_id = s.id
    WHERE
      (a.approve_date IS NULL) AND
      (r.report_date IS NULL) AND
      (s.game_id = abb)
    ORDER BY s.id
  ) submissions_row
$$;

-- Next, get reported RPC
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
      s.mod_note,
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
      s.tas,
      (SELECT row_to_json(version_row) FROM (SELECT v.id, v.version, v.sequence FROM version v WHERE v.id = s.version) AS version_row) version
    FROM submission s
    INNER JOIN report r ON r.submission_id = s.id
    INNER JOIN profile p ON p.id = r.creator_id
    WHERE s.game_id = abb
    ORDER BY r.report_date
  ) submissions_row
$$;

-- Create an RPC for adding versions from admin panel
CREATE OR REPLACE FUNCTION add_versions (versions JSONB)
RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
  game_abb text;
  latest_version int;
  version_ids int[];
  i int;
  version_charts jsonb;
  version_id int;
  count int;
BEGIN
  -- Validate `versions` array is non-empty
  IF jsonb_array_length(versions) = 0 THEN
    RAISE EXCEPTION 'Must add at least one version.';
  END IF;

  -- Determine game from `versions` parameter
  game_abb := (versions->0->>'game')::text;

  -- If we have at least one chart, fetch the id of the most recent version belonging to `game_abb`
  SELECT id
  INTO latest_version
  FROM version
  WHERE game = game_abb
  ORDER BY sequence DESC
  LIMIT 1;

  -- Insert into `versions` table, and capture the IDs
  WITH inserted_versions AS (
    INSERT INTO version (game, sequence, version)
    SELECT game, sequence, version
    FROM jsonb_to_recordset(versions) AS v(game text, sequence int, version text)
    RETURNING id, sequence
  )
  SELECT array_agg(id ORDER BY sequence)
  INTO version_ids
  FROM inserted_versions;

  -- Loop over versions, and update chart submissions, if any
  FOR i IN 1..jsonb_array_length(versions) LOOP
    version_charts := (versions->(i-1))->'charts';
    version_id := version_ids[i];

    IF version_charts IS NOT NULL THEN
      UPDATE submission s
      SET version = version_id
      WHERE 
        (s.version = latest_version OR (latest_version IS NULL)) AND
        (s.category, s.game_id, s.level_id) IN (
          SELECT category, game_id, level_id
          FROM jsonb_to_recordset(version_charts)
          AS charts(category text, game_id text, level_id text)
        );
    END IF;
  END LOOP;
END;
$$;

-- Add RLS to allow admins to update the version changed of ANY submission
CREATE OR REPLACE FUNCTION is_only_version_changed (
  submission_id TIMESTAMPTZ,
  new_tas BOOLEAN,
  new_submitted_at TIMESTAMPTZ,
  new_monkey_id INT,
  new_platform_id INT,
  new_region_id INT,
  new_proof TEXT,
  new_comment TEXT,
  new_live BOOLEAN,
  new_mod_note TEXT,
  new_version INT
)
RETURNS BOOLEAN
LANGUAGE sql
AS $$
  SELECT (
    s.tas = new_tas AND
    s.submitted_at = new_submitted_at AND
    s.monkey_id = new_monkey_id AND
    s.platform_id = new_platform_id AND
    s.region_id = new_region_id AND
    s.proof = new_proof AND
    s.comment = new_comment AND
    s.live = new_live AND
    s.mod_note = new_mod_note AND
    COALESCE(s.version, -1) <> COALESCE(new_version, -1)
  )
  FROM submission s
  WHERE s.id = submission_id
$$;

CREATE POLICY "Enable admins to update version"
ON submission 
AS PERMISSIVE
FOR UPDATE 
TO authenticated 
USING (is_admin()) 
WITH CHECK (
  is_only_version_changed(
    submission.id,
    submission.tas,
    submission.submitted_at,
    submission.monkey_id,
    submission.platform_id,
    submission.region_id,
    submission.proof,
    submission.comment,
    submission.live,
    submission.mod_note,
    submission.version
  )
);