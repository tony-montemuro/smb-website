CREATE OR REPLACE FUNCTION get_profile(profile_id integer)
RETURNS json
LANGUAGE sql
AS $$
  SELECT row_to_json(profiles_row)
  FROM (
    SELECT
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
          WHERE gp.profile = profile_id
          ORDER BY g.id
        ) g
      ) moderated_games,
      (
        SELECT json_agg(jsonb_build_object(
          'abb', g.abb,
          'categories', (
            SELECT json_agg(jsonb_build_object(
              'name', c.category,
              'types', (
                SELECT json_agg(DISTINCT l.chart_type)
                FROM level l
                WHERE l.game = g.abb AND l.category = c.category
              )
            ))
            FROM (
              SELECT DISTINCT ON (m.category) m.category, m.id
              FROM mode m
              WHERE m.game = g.abb
              ORDER BY m.category, m.id
            ) c
          ),
          'custom', g.custom,
          'name', g.name,
          'live_preference', g.live_preference
        ) ORDER BY g.id) AS submitted_games
        FROM (
          SELECT DISTINCT ON (s.game_id) s.game_id AS abb, g.custom, g.id, g.live_preference, g.name
          FROM submission s
          INNER JOIN game AS g ON g.abb = s.game_id
          WHERE s.profile_id = profile_id
        ) g
      ) submitted_games,
      twitch_username,
      twitter_handle,
      username,
      video_description,
      youtube_handle
    FROM profile p
    WHERE id = profile_id
  ) profiles_row
$$;