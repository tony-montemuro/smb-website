CREATE OR REPLACE FUNCTION get_ranked_submissions(game_name text, category_name category_t, is_score boolean, live_only boolean)
RETURNS TABLE (
  game_id text,
  level_id text,
  category category_t,
  id integer,
  username varchar(25),
  country text,
  record float8,
  submitted_at timestamptz,
  live boolean
)
LANGUAGE sql
AS $$
  WITH ranked AS (
    SELECT s.game_id, s.level_id, s.category, p.id, p.username, p.country, s.record, s.score, s.submitted_at, s.live, ROW_NUMBER() OVER (PARTITION BY s.profile_id, s.game_id, s.category, s.level_id, s.score, CASE WHEN live_only THEN s.live ELSE NULL END ORDER BY s.submitted_at DESC) AS rn
    FROM submission s
    JOIN profile p ON s.profile_id = p.id
    WHERE s.game_id = game_name AND s.category = category_name AND s.score = is_score AND tas = false AND (NOT live_only OR s.live = true)
  )
  SELECT r.game_id, r.level_id, r.category, r.id, r.username, r.country, r.record, r.submitted_at, r.live
  FROM ranked r
  WHERE r.rn = 1
  ORDER BY r.level_id ASC, r.record DESC, r.submitted_at ASC
$$;

CREATE OR REPLACE FUNCTION get_category_time(game_name text, category_name category_t)
RETURNS float4
LANGUAGE sql
AS $$
  SELECT COALESCE(SUM(time), 0::float4)
  FROM level
  WHERE game = game_name AND category = category_name AND chart_type <> 'score'::chart_t;
$$;