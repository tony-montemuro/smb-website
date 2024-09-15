-- Create new table for goal types
CREATE TABLE goal (
  id SERIAL PRIMARY KEY,
  name VARCHAR(256) UNIQUE NOT NULL,
  color VARCHAR(7) UNIQUE NOT NULL
);

ALTER TABLE goal
ADD CONSTRAINT goal_name_content_constraint
CHECK (length(name) > 0 AND name ~ '^[a-z]+$');

ALTER TABLE goal
ADD CONSTRAINT goal_color_content_constraint
CHECK (color ~ '^#[a-f0-9]{6}$');

INSERT INTO goal (name, color)
VALUES
  ('blue', '#3a69a4'),
  ('green', '#37ad58'),
  ('red', '#ae3c43'),
  ('stunt', '#bb00ff');

ALTER TABLE goal ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users"
ON goal
TO public
USING (true);

CREATE POLICY "Enable insert for administrators"
ON goal
FOR INSERT
TO authenticated
WITH CHECK (
  (is_admin())
);

-- Redefine `get_profile`, since we are removing `id` attribute from `game` table
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
          'name', g.name,
          'live_preference', g.live_preference
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

ALTER TABLE game
DROP COLUMN id;

-- Enable admins to create new profiles
DROP POLICY "Enable authenticated users to insert their own row" ON profile;

CREATE POLICY "Enable insert for admins, & authenticated users their own row"
ON profile
AS PERMISSIVE
FOR INSERT
TO authenticated 
WITH CHECK (
  auth.uid() = user_id OR is_admin()
);

-- Add "order" to game entities: monkeys, regions, & platforms
ALTER TABLE game_monkey
ADD COLUMN id INTEGER;

WITH ordered AS (
  SELECT
    game,
    monkey,
    ROW_NUMBER() OVER (PARTITION BY game ORDER BY monkey) AS new_id
  FROM game_monkey
)
UPDATE game_monkey gm
SET id = o.new_id
FROM ordered o
WHERE gm.game = o.game AND gm.monkey = o.monkey;

ALTER TABLE game_monkey
ALTER COLUMN id SET NOT NULL;

ALTER TABLE game_region
ADD COLUMN id INTEGER;

WITH ordered AS (
  SELECT
    game,
    region,
    ROW_NUMBER() OVER (PARTITION BY game ORDER BY region) AS new_id
  FROM game_region
)
UPDATE game_region gr
SET id = o.new_id
FROM ordered o
WHERE gr.game = o.game AND gr.region = o.region;

ALTER TABLE game_region
ALTER COLUMN id SET NOT NULL;

ALTER TABLE game_platform
ADD COLUMN id INTEGER;

WITH ordered AS (
  SELECT
    game,
    platform,
    ROW_NUMBER() OVER (PARTITION BY game ORDER BY platform) AS new_id
  FROM game_platform
)
UPDATE game_platform gp
SET id = o.new_id
FROM ordered o
WHERE gp.game = o.game AND gp.platform = o.platform;

ALTER TABLE game_platform
ALTER COLUMN id SET NOT NULL;

-- Need to redefine this function, since we removed the `id` attribute from `game` table, and to add order to
-- 'entity' tables
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
      COUNT(CASE WHEN s.id IS NOT NULL AND a.submission_id IS NULL AND r.submission_id IS NULL THEN 1 ELSE NULL END) AS unapproved
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

-- INSERT PERMISSIONS FOR ADMINS
CREATE POLICY "Enable insert for administrators"
ON category
FOR INSERT
TO authenticated
WITH CHECK (
  (is_admin())
);

CREATE POLICY "Enable insert for administrators"
ON game
FOR INSERT
TO authenticated
WITH CHECK (
  (is_admin())
);

CREATE POLICY "Enable insert for administrators"
ON game_monkey
FOR INSERT
TO authenticated
WITH CHECK (
  (is_admin())
);

CREATE POLICY "Enable insert for administrators"
ON game_platform
FOR INSERT
TO authenticated
WITH CHECK (
  (is_admin())
);

CREATE POLICY "Enable insert for administrators"
ON game_region
FOR INSERT
TO authenticated
WITH CHECK (
  (is_admin())
);

CREATE POLICY "Enable insert for administrators"
ON game_rule
FOR INSERT
TO authenticated
WITH CHECK (
  (is_admin())
);

CREATE POLICY "Enable insert for administrators"
ON level
FOR INSERT
TO authenticated
WITH CHECK (
  (is_admin())
);

CREATE POLICY "Enable insert for administrators"
ON mode
FOR INSERT
TO authenticated
WITH CHECK (
  (is_admin())
);

CREATE POLICY "Enable insert for administrators"
ON monkey
FOR INSERT
TO authenticated
WITH CHECK (
  (is_admin())
);

CREATE POLICY "Enable insert for administrators"
ON platform
FOR INSERT
TO authenticated
WITH CHECK (
  (is_admin())
);

CREATE POLICY "Enable insert for administrators"
ON region
FOR INSERT
TO authenticated
WITH CHECK (
  (is_admin())
);

CREATE POLICY "Enable insert for administrators"
ON rule
FOR INSERT
TO authenticated
WITH CHECK (
  (is_admin())
);

-- Let's switch from integers to sequences for "entity" primary keys
ALTER TABLE monkey
ALTER id ADD GENERATED BY DEFAULT AS IDENTITY;
SELECT SETVAL(pg_get_serial_sequence('monkey', 'id'), (SELECT MAX(id) FROM monkey), true);

ALTER TABLE platform
ALTER id ADD GENERATED BY DEFAULT AS IDENTITY;
SELECT SETVAL(pg_get_serial_sequence('platform', 'id'), (SELECT MAX(id) FROM platform), true);

ALTER TABLE region
ALTER id ADD GENERATED BY DEFAULT AS IDENTITY;
SELECT SETVAL(pg_get_serial_sequence('region', 'id'), (SELECT MAX(id) FROM region), true);

ALTER TABLE rule
ALTER id ADD GENERATED BY DEFAULT AS IDENTITY;
SELECT SETVAL(pg_get_serial_sequence('rule', 'id'), (SELECT MAX(id) FROM rule), true);

ALTER TABLE category
ALTER id ADD GENERATED BY DEFAULT AS IDENTITY;
SELECT SETVAL(pg_get_serial_sequence('category', 'id'), (SELECT MAX(id) FROM category), true);

-- Add character limits to `rule` & `category` tables
ALTER TABLE rule
ALTER rule_name TYPE VARCHAR(1024);

ALTER TABLE category
ALTER abb TYPE VARCHAR(15);

-- Separate out unique constraint on platform table
ALTER TABLE platform
DROP CONSTRAINT platform_name_abb_key;

ALTER TABLE platform
ADD CONSTRAINT platform_name_key UNIQUE (platform_name);

ALTER TABLE platform
ADD CONSTRAINT platform_abb_key UNIQUE (platform_abb);

-- Add unique constraint to `region` table
ALTER TABLE region
ADD CONSTRAINT region_name_key UNIQUE (region_name);

-- Add unique constraint to `category` table, abb format constraint, and name constraint
ALTER TABLE category
ADD CONSTRAINT category_unique_constraint UNIQUE (name, practice);

ALTER TABLE public.category
ADD CONSTRAINT category_abb_format
CHECK (abb ~ '^[a-z0-9][a-z0-9_]*$');

ALTER TABLE category
ADD CONSTRAINT category_non_empty_name
CHECK (length(name) > 0);

-- Functions used on game structure page
CREATE OR REPLACE FUNCTION get_chart_types()
RETURNS json
LANGUAGE sql
AS $$
  SELECT array_to_json(ARRAY(
    SELECT unnest(enum_range(NULL::chart_t))::text AS chart_type
    ORDER BY chart_type
  ));
$$;

CREATE OR REPLACE FUNCTION get_timer_types()
RETURNS json
LANGUAGE sql
AS $$
  SELECT json_agg(timer_type)::json
  FROM unnest(enum_range(NULL::timer_t)) AS timer_type;
$$;

-- Encode special characters that currently exist
UPDATE level
SET name = REPLACE(name, ':', '%3A')
WHERE name LIKE '%:%';

UPDATE level
SET name = REPLACE(name, ',', '%2C')
WHERE name LIKE '%,%';

UPDATE level
SET name = REPLACE(name, '&', '%26')
WHERE name LIKE '%&%';

-- Queries that fix data, so all levels will pass new restrictions
UPDATE level
SET time = 0
WHERE ascending = 'time';

UPDATE level
SET timer_type = NULL
WHERE chart_type = 'score';

-- Function that tests if a string is "url-safe"
CREATE OR REPLACE FUNCTION is_url_safe(input TEXT)
RETURNS BOOLEAN AS $$
  SELECT input ~ '^[a-zA-Z0-9\-_.!~*''()%]+$';
$$ LANGUAGE sql;

-- Constraints on game table
ALTER TABLE game
ADD CONSTRAINT game_abb_valid
CHECK (abb ~ '^[a-z0-9]+$');

ALTER TABLE game
ADD CONSTRAINT game_date_constraint
CHECK (min_date <= release_date);

ALTER TABLE game
ADD CONSTRAINT game_name_constraint
CHECK (length(name) > 0);

ALTER TABLE game
ADD CONSTRAINT game_download_constraint
CHECK (download IS NULL OR length(download) > 0);

-- Constraints on mode & level table
ALTER TABLE mode
ADD CONSTRAINT name_url_valid 
CHECK (is_url_safe(name) AND length(name) > 0);

ALTER TABLE level
ADD CONSTRAINT name_url_valid
CHECK (is_url_safe(name) AND length(name) > 0);

ALTER TABLE level
ADD CONSTRAINT score_chart_restrictions
CHECK (chart_type <> 'score' OR (timer_type IS NULL AND time = 0 AND ascending NOT IN ('both', 'time')));

ALTER TABLE level
ADD CONSTRAINT time_chart_restrictions
CHECK (chart_type <> 'time' OR (ascending NOT IN ('both', 'score')));

ALTER TABLE level
ADD CONSTRAINT time_both_chart_restrictions
CHECK (chart_type = 'score' OR (
  timer_type IS NOT NULL AND (
    ascending = 'score' OR ascending IS NULL OR time = 0
  )
));

-- Add permissions for storage buckets
CREATE POLICY "Admins can insert box art"
on "storage"."objects"
AS permissive
FOR INSERT
TO authenticated
WITH CHECK ((bucket_id = 'games'::text) AND (is_admin()) AND (storage.extension(name) = 'png'::text));

CREATE POLICY "Admins can update box art"
ON "storage"."objects"
AS permissive
FOR UPDATE
TO authenticated
USING ((bucket_id = 'games'::text) AND (is_admin()) AND (storage.extension(name) = 'png'::text))
WITH CHECK ((bucket_id = 'games'::text) AND (is_admin()) AND (storage.extension(name) = 'png'::text));

-- Function for adding the game to the db
CREATE FUNCTION add_game(game JSONB, modes JSONB, levels JSONB, game_monkeys JSONB, game_platforms JSONB, game_profiles JSONB, game_regions JSONB, game_rules JSONB)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  -- Insert game
  INSERT INTO game (abb, name, custom, release_date, creator, download, live_preference, min_date)
  SELECT abb, name, custom, release_date, creator, download, live_preference, min_date
  FROM jsonb_to_record(game) AS g(abb text, name text, custom boolean, release_date date, creator int, download text, live_preference boolean, min_date date);

  -- Insert modes
  INSERT INTO mode (game, name, category, id)
  SELECT m.game, name, category, id
  FROM jsonb_to_recordset(modes) AS m(game text, name text, category text, id int);

  -- Insert levels
  INSERT INTO level (game, name, category, id, mode, chart_type, time, timer_type, ascending)
  SELECT l.game, name, category, id, mode, chart_type, time, timer_type, ascending
  FROM jsonb_to_recordset(levels) AS l(game text, name text, category text, id int, mode text, chart_type chart_t, time float, timer_type timer_t, ascending chart_t);

  -- Insert game monkeys
  INSERT INTO game_monkey (game, monkey, id)
  SELECT gm.game, monkey, id
  FROM jsonb_to_recordset(game_monkeys) AS gm(game text, monkey int, id int);

  -- Insert game platforms
  INSERT INTO game_platform (game, platform, id)
  SELECT gpl.game, platform, id
  FROM jsonb_to_recordset(game_platforms) AS gpl(game text, platform int, id int);

  -- Insert game profiles
  INSERT INTO game_profile (game, profile)
  SELECT gpr.game, profile
  FROM jsonb_to_recordset(game_profiles) AS gpr(game text, profile int);

  -- Insert game regions
  INSERT INTO game_region (game, region, id)
  SELECT gre.game, region, id
  FROM jsonb_to_recordset(game_regions) AS gre(game text, region int, id int);

  -- Insert game rules
  INSERT INTO game_rule (abb, rule, id)
  SELECT gru.game, rule, id
  FROM jsonb_to_recordset(game_rules) AS gru(game text, rule int, id int);
END;
$$;