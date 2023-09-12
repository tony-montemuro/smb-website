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
      (SELECT array_agg(DISTINCT s.game_id) AS submitted_games FROM submission s WHERE s.profile_id = p.id GROUP BY s.profile_id),
      twitch_username,
      twitter_handle,
      username,
      video_description,
      youtube_handle
    FROM profile p
    WHERE id = profile_id
  ) profiles_row
$$;