CREATE OR REPLACE FUNCTION get_unapproved(abb text)
RETURNS json
LANGUAGE sql
AS $$
  SELECT COALESCE((json_agg(row_to_json(submissions_row))), '[]'::json)
  FROM (
    SELECT
      all_position,
      comment,
      id,
      (SELECT jsonb_build_object('category', l.category, 'name', l.name, 'timer_type', l.timer_type, 'mode', jsonb_build_object('game', jsonb_build_object('abb', g.abb, 'name', g.name))) FROM level l INNER JOIN mode m ON l.game = m.game AND l.mode = m.name AND l.category = m.category INNER JOIN game g ON m.game = g.abb WHERE l.game = s.game_id AND l.name = s.level_id AND l.category = s.category) AS "level",
      live,
      (SELECT row_to_json(monkey_row) FROM (SELECT m.id, m.monkey_name FROM monkey m WHERE m.id = s.monkey_id) AS monkey_row) monkey,
      (SELECT row_to_json(platform_row) FROM (SELECT pl.id, pl.platform_name FROM platform pl WHERE pl.id = s.platform_id) AS platform_row) platform,
      position,
      (SELECT row_to_json(profile_row) FROM (SELECT pr.country, pr.id, pr.username FROM profile pr WHERE pr.id = s.profile_id) AS profile_row) profile,
      (SELECT row_to_json(region_row) FROM (SELECT rg.id, rg.region_name FROM region rg WHERE rg.id = s.region_id) AS region_row) region,
      (SELECT jsonb_build_object('creator', jsonb_build_object('country', p.country, 'id', p.id, 'username', p.username), 'message', rp.message, 'report_date', rp.report_date) FROM report rp INNER JOIN profile p ON rp.creator_id = p.id WHERE rp.submission_id = s.id) AS "report",
      proof,
      record,
      score,
      submitted_at,
      tas
    FROM submission s
    WHERE 
      ((SELECT approve_date FROM approve a WHERE a.submission_id = s.id) IS NULL) 
      AND 
      ((SELECT report_date FROM report r WHERE r.submission_id = s.id) IS NULL)
      AND
      (s.game_id = abb)
    ORDER BY s.id
  ) submissions_row
$$;

CREATE OR REPLACE FUNCTION get_reported(abb text)
RETURNS json
LANGUAGE sql
AS $$
  SELECT COALESCE((json_agg(row_to_json(submissions_row))), '[]'::json)
  FROM (
    SELECT
      all_position,
      comment,
      id,
      (SELECT jsonb_build_object('category', l.category, 'name', l.name, 'timer_type', l.timer_type, 'mode', jsonb_build_object('game', jsonb_build_object('abb', g.abb, 'name', g.name))) FROM level l INNER JOIN mode m ON l.game = m.game AND l.mode = m.name AND l.category = m.category INNER JOIN game g ON m.game = g.abb WHERE l.game = s.game_id AND l.name = s.level_id AND l.category = s.category) AS "level",
      live,
      (SELECT row_to_json(monkey_row) FROM (SELECT m.id, m.monkey_name FROM monkey m WHERE m.id = s.monkey_id) AS monkey_row) monkey,
      (SELECT row_to_json(platform_row) FROM (SELECT pl.id, pl.platform_name FROM platform pl WHERE pl.id = s.platform_id) AS platform_row) platform,
      position,
      (SELECT row_to_json(profile_row) FROM (SELECT pr.country, pr.id, pr.username FROM profile pr WHERE pr.id = s.profile_id) AS profile_row) profile,
      (SELECT row_to_json(region_row) FROM (SELECT rg.id, rg.region_name FROM region rg WHERE rg.id = s.region_id) AS region_row) region,
      (SELECT jsonb_build_object('creator', jsonb_build_object('country', p.country, 'id', p.id, 'username', p.username), 'message', rp.message, 'report_date', rp.report_date) FROM report rp INNER JOIN profile p ON rp.creator_id = p.id WHERE rp.submission_id = s.id) AS "report",
      proof,
      record,
      score,
      submitted_at,
      tas
    FROM submission s
    WHERE
      ((SELECT approve_date FROM approve a WHERE a.submission_id = s.id) IS NULL) 
      AND 
      ((SELECT report_date FROM report r WHERE r.submission_id = s.id) IS NOT NULL)
      AND 
      (s.game_id = abb)
    ORDER BY s.id
  ) submissions_row
$$;