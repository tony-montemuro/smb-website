CREATE OR REPLACE FUNCTION get_unapproved_counts(abbs text[])
RETURNS json
LANGUAGE sql
AS $$
  SELECT json_agg(row_to_json(submission_row))
  FROM (
    SELECT 
      g.abb AS abb, 
      g.name, 
      COUNT(CASE WHEN s.id IS NOT NULL AND a.submission_id IS NULL AND r.submission_id IS NULL THEN 1 ELSE NULL END) AS unapproved, 
      COUNT(CASE WHEN s.id IS NOT NULL AND a.submission_id IS NULL AND r.submission_id IS NOT NULL THEN 1 ELSE NULL END) AS reported,
      (
        SELECT json_agg(monkey_row)
        FROM (
          SELECT m.id, m.monkey_name
          FROM game_monkey gm
          INNER JOIN monkey m ON gm.monkey = m.id
          WHERE gm.game = g.abb
        ) monkey_row
      ) AS monkey,
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
      ) AS region
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
  ) submission_row
$$;