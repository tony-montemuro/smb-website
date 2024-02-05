ALTER TABLE game
ADD COLUMN min_date date;

UPDATE game
SET min_date = release_date;

UPDATE game
SET min_date = '2021-10-31'
WHERE abb = 'stardust';

ALTER TABLE game
ALTER COLUMN min_date
SET NOT NULL;

ALTER TABLE game
ALTER COLUMN release_date
SET NOT NULL;

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
    (submitted_at >= (SELECT min_date FROM game WHERE abb = game_id))
  )
);

DROP POLICY IF EXISTS "Update restrictions [RESTRICTIVE]" ON submission;

CREATE POLICY "Update restrictions [RESTRICTIVE]"
ON submission 
AS RESTRICTIVE 
FOR UPDATE 
TO authenticated 
USING (true) 
WITH CHECK (
  (
    valid_monkey_platform_region(game_id, monkey_id, platform_id, region_id)
  AND
    (submitted_at >= (SELECT min_date FROM game WHERE abb = game_id))
  )
);

CREATE OR REPLACE FUNCTION get_unapproved_counts(abbs text[])
RETURNS json
LANGUAGE sql
AS $$
  SELECT json_agg(row_to_json(submission_row))
  FROM (
    SELECT 
      g.abb AS abb,
      g.id,
      g.min_date,
      (
        SELECT json_agg(monkey_row)
        FROM (
          SELECT m.id, m.monkey_name
          FROM game_monkey gm
          INNER JOIN monkey m ON gm.monkey = m.id
          WHERE gm.game = g.abb
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
        ) platform_row
      ) AS platform,
      (
        SELECT json_agg(region_row)
        FROM (
          SELECT r.id, r.region_name
          FROM game_region gr
          INNER JOIN region r ON gr.region = r.id
          WHERE gr.game = g.abb
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
    ORDER BY g.id
  ) submission_row
$$;