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

-- INSERT PERMISSIONS
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

-- Add unique constraint to `category` table, and abb format constraint
ALTER TABLE category
ADD CONSTRAINT category_unique_constraint UNIQUE (name, practice);

ALTER TABLE public.category
ADD CONSTRAINT category_abb_format CHECK (abb ~ '^[a-z0-9][a-z0-9_]*$');

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

-- Constraints on mode table
ALTER TABLE mode
ADD CONSTRAINT name_no_question_marks 
CHECK (position('?' in name) = 0);

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

-- Constraints on level table
ALTER TABLE level
ADD CONSTRAINT name_url_valid
CHECK (name ~ '^[a-zA-Z0-9\-_.!~*''()]+$');