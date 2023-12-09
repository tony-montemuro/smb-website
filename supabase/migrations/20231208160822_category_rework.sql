-- Step 1: Remove level foreign keys
ALTER TABLE notification
DROP CONSTRAINT notification_level_fk;

ALTER TABLE submission
DROP CONSTRAINT submission_level_fk;

-- Step 2: Remove mode foreign keys
ALTER TABLE level
DROP CONSTRAINT levelfk;

-- Step 3: Create category table
CREATE TABLE category (
  abb text PRIMARY KEY,
  name text NOT NULL,
  practice boolean NOT NULL,
  id int NOT NULL CHECK (id > 0)
);

ALTER TABLE category ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read acccess for all users" 
ON category 
FOR SELECT 
TO public
USING (true);

INSERT INTO category (abb, name, practice, id)
VALUES
  ('main', 'Practice Mode', true, 1),
  ('main_sweep', 'Practice Mode (Sweep)', true, 2),
  ('misc', 'Miscellaneous Practice Mode', true, 3),
  ('normal', 'Normal Mode', false, 4),
  ('story', 'Story Mode', false, 5),
  ('challenge', 'Challenge Mode', false, 6),
  ('main_jump', 'Practice Mode (Jumps)', true, 7),
  ('special', 'Special Mode', true, 8),
  ('special_jump', 'Special Mode (Jumps)', true, 9),
  ('ranking', 'Ranking Challenge', false, 10),
  ('party', 'Party Games', false, 11),
  ('interstellar', 'Interstellar Mode', false, 12);

-- Step 4: Add category foreign key to `mode`
ALTER TABLE mode ALTER COLUMN category TYPE text;
ALTER TABLE mode ADD CONSTRAINT mode_category_fk FOREIGN KEY (category) REFERENCES category (abb);

-- Step 5: Re-add level foreign key to `mode`
ALTER TABLE level ALTER COLUMN category TYPE text;
ALTER TABLE level ADD CONSTRAINT level_fk FOREIGN KEY (game, mode, category) REFERENCES mode (game, name, category) MATCH FULL;

-- Step 6: Re-add all foreign keys to `level`
DROP POLICY IF EXISTS "Enable restricted insert access for users" ON "notification";

ALTER TABLE notification ALTER COLUMN category TYPE text;
ALTER TABLE notification ADD CONSTRAINT notification_level_fk FOREIGN KEY (game_id, level_id, category) REFERENCES level (game, name, category) MATCH FULL;
ALTER TABLE submission ALTER COLUMN category TYPE text;
ALTER TABLE submission ADD CONSTRAINT submission_level_fk FOREIGN KEY (game_id, level_id, category) REFERENCES level (game, name, category) MATCH FULL;

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
        submission.profile_id = notification.profile_id
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

-- Step 7: Update function definitions to replace `category_t` -> `text`
DROP FUNCTION IF EXISTS get_ranked_submissions(text, category_t, boolean, boolean);
CREATE FUNCTION get_ranked_submissions(game_name text, category_name text, is_score boolean, live_only boolean)
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
    SELECT s.game_id, s.level_id, s.category, p.id, p.username, p.country, s.record, s.score, s.submitted_at, s.live, l.id AS level_ctr, ROW_NUMBER() OVER (PARTITION BY (s.profile_id, s.game_id, s.category, s.level_id, s.score, CASE WHEN live_only THEN s.live ELSE NULL END) ORDER BY s.submitted_at DESC) AS rn
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

DROP FUNCTION IF EXISTS get_category_levels_by_mode(text, category_t, boolean);
CREATE FUNCTION get_category_levels_by_mode(game_name text, category_name text, is_score boolean)
RETURNS TABLE (name text)
LANGUAGE sql
AS $$
  SELECT COALESCE(json_agg(row_to_json(record_row)), '[]'::json)
  FROM (
    SELECT
      name,
      (
        SELECT json_agg(row_to_json(levels_row))
        FROM (
            SELECT
                l.name,
                l.timer_type
            FROM level l
            WHERE (m.game = l.game AND m.category = l.category AND m.name = l.mode) AND ((is_score = true AND l.chart_type IN ('score', 'both')) OR (is_score = false AND l.chart_type IN ('time', 'both')))
            ORDER BY l.id
        ) levels_row
      ) AS levels
    FROM mode m
    WHERE (EXISTS (
      SELECT 1
      FROM level l
      WHERE (m.game = l.game AND m.category = l.category AND m.name = l.mode) AND ((is_score = true AND l.chart_type IN ('score', 'both')) OR (is_score = false AND l.chart_type IN ('time', 'both')))
    )) AND m.game = game_name AND m.category = category_name
    ORDER BY m.id
  ) record_row
$$;

DROP FUNCTION IF EXISTS get_user_rankings(text, category_t, boolean, boolean, integer);
CREATE FUNCTION get_user_rankings( abb text, category text, score boolean, live_only boolean, profile_id integer )
RETURNS json
LANGUAGE plv8
AS $$
  // -- first, get the ranked submissions according to the function parameters
  let query = 'SELECT * FROM get_ranked_submissions($1, $2, $3, $4)';
  let paramTypes = ['text', 'text', 'boolean', 'boolean'];
  let plan = plv8.prepare(query, paramTypes);
  const submissions = plan.execute( [abb, category, score, live_only] );
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


DROP FUNCTION IF EXISTS get_records(text, category_t, boolean, boolean);
CREATE FUNCTION get_records(abb text, category text, score boolean, live_only boolean)
RETURNS json
LANGUAGE plv8
AS $$
  // -- first, get the ranked submissions according to the function parameters
  let query = 'SELECT * FROM get_ranked_submissions($1, $2, $3, $4)';
  let paramTypes = ['text', 'text', 'boolean', 'boolean'];
  let plan = plv8.prepare(query, paramTypes);
  const submissions = plan.execute( [abb, category, score, live_only] );
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

        // -- if current submission has position of 1, it is record. thus, we need to update record object
        const submission = submissions[index];
        if (submission.position === 1) {
          const profile = { country: submission.country, id: submission.id, username: submission.username };
          recordObj.record = submission.record;
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

DROP FUNCTION IF EXISTS get_categories(); -- this function will be obsoleted by this migration

DROP FUNCTION IF EXISTS get_chart_submissions(text, category_t, text, boolean);
CREATE FUNCTION get_chart_submissions(game text, category_name text, level text, is_score boolean) 
RETURNS json
LANGUAGE sql
AS $$
  WITH chart_submissions AS (
    SELECT *
    FROM submission s
    WHERE s.game_id = game AND s.category = category_name AND s.level_id = level AND s.score = is_score
  ),
  ranked_by_profile AS (
    SELECT cs.id, cs.record, cs.live, ROW_NUMBER() OVER (PARTITION BY cs.profile_id ORDER BY cs.submitted_at DESC) AS rn
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

DROP FUNCTION IF EXISTS get_medals(text, category_t, boolean);
CREATE FUNCTION get_medals(abb text, category text, score boolean)
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
  FROM get_ranked_submissions(abb, category, score, true)
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
SELECT CASE WHEN category IN ('main', 'misc') THEN COALESCE((json_agg(row_to_json(medals_row))), '[]'::json) ELSE '[]'::json END
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

DROP FUNCTION IF EXISTS get_totals(text, category_t, boolean, boolean);
CREATE FUNCTION get_totals(abb text, category text, score boolean, live_only boolean)
RETURNS json
LANGUAGE plv8
AS $$
  // -- first, this code should only really execute for "practice mode" categories, a.k.a., when the `category` param is "main" or "misc". return an empty array otherwise
  if (category !== "main" && category !== "misc") {
    return [];
  }

  // -- next, get the ranked submissions according to the function parameters
  let query = 'SELECT * FROM get_ranked_submissions($1, $2, $3, $4)';
  let paramTypes = ['text', 'text', 'boolean', 'boolean'];
  let plan = plv8.prepare(query, paramTypes);
  const submissions = plan.execute( [abb, category, score, live_only] );
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

DROP FUNCTION IF EXISTS get_category_time(text, category_t);
CREATE FUNCTION get_category_time(game_name text, category_name text)
RETURNS float4
LANGUAGE sql
AS $$
  SELECT COALESCE(SUM(time), 0::float4)
  FROM level
  WHERE game = game_name AND category = category_name AND chart_type <> 'score'::chart_t;
$$;

DROP FUNCTION get_profile(integer);
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
        ) ORDER BY g.id)), '[]'::json)
        FROM (
          SELECT g.abb, g.custom, g.id, g.name
          FROM game_profile gp
          INNER JOIN game AS g ON g.abb = gp.game
          WHERE gp.profile = p_id
          ORDER BY g.id
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
          'name', g.name,
          'live_preference', g.live_preference
        ) ORDER BY g.id), '[]'::json) AS submitted_games
        FROM (
          SELECT DISTINCT ON (s.game_id) s.game_id AS abb, g.custom, g.id, g.live_preference, g.name
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

-- Step 8: Drop `category_t`
DROP TYPE category_t;