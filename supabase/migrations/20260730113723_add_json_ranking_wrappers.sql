-- Add json returning wrappers for the ranking helper functions, so that they can be called over the API. PostgREST truncates a
-- set returning function at `max_rows`, and the largest games already return more rows than that. Aggregation into a single json
-- row means the limit cannot apply.
--
-- Each wrapper depends on `json_agg` preserving the row order of the function it wraps, which the callers rely on. That order
-- cannot be restated here, because the helpers order by a level column which is not part of their result.
--
-- `extra_float_digits` is raised, because the server rounds a float8 to 15 significant digits by default. Some records are stored
-- as a double which needs 17 digits, and rounding one loses the precision that the leaderboards are computed from.

CREATE OR REPLACE FUNCTION get_ranked_submissions_json(game_name text, category_name text, is_score boolean, live_only boolean, version_key int)
RETURNS json
LANGUAGE sql
SET extra_float_digits = 1
AS $$
  SELECT COALESCE(json_agg(row_to_json(s)), '[]'::json)
  FROM get_ranked_submissions(game_name, category_name, is_score, live_only, version_key) s
$$;

CREATE OR REPLACE FUNCTION get_record_submissions_json(game_name text, category_name text, is_score boolean, live_only boolean, version_key int)
RETURNS json
LANGUAGE sql
SET extra_float_digits = 1
AS $$
  SELECT COALESCE(json_agg(row_to_json(s)), '[]'::json)
  FROM get_record_submissions(game_name, category_name, is_score, live_only, version_key) s
$$;
