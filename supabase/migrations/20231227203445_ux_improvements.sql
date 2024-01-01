ALTER TABLE notification
DROP CONSTRAINT notification_level_fk,
ADD CONSTRAINT notification_level_fk
FOREIGN KEY (game_id, level_id, category)
REFERENCES level (game, name, category) MATCH FULL
ON UPDATE CASCADE;

ALTER TABLE submission
DROP CONSTRAINT submission_level_fk,
ADD CONSTRAINT submission_level_fk
FOREIGN KEY (game_id, level_id, category)
REFERENCES level (game, name, category) MATCH FULL
ON UPDATE CASCADE;

UPDATE level
SET name = REPLACE(name, '?', '%3F')
WHERE name LIKE '%?%';

DROP POLICY "Report insert restrictions for authenticated users" 
ON report;

CREATE POLICY "Enable insert for authenticated users" 
ON report 
FOR INSERT 
TO authenticated 
WITH CHECK (creator_id = get_profile_id());

CREATE POLICY "Enable delete for administrators" 
ON report
FOR DELETE
TO authenticated
USING (is_admin());

CREATE OR REPLACE FUNCTION decrement_report_token() 
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  reported_submission submission%ROWTYPE;
BEGIN
  -- First, fetch reported submission data using the `submission_id` field
  SELECT *
  FROM submission
  INTO reported_submission
  WHERE id = NEW.submission_id;

  -- This function will only do something if
  -- 1.) User is normal (not moderator / administrator)
  -- 2.) Creator of report differs from owner of submission
  IF (NOT (is_moderator(reported_submission.game_id)) AND NEW.creator_id <> reported_submission.profile_id) THEN
    -- Check if the profile has greater than 0 report tokens
    IF (SELECT report_token FROM profile WHERE user_id = auth.uid()) <= 0 THEN
      RAISE EXCEPTION 'You have ran out of reports for the day. Try again tomorrow.';
    END IF;

    -- Decrement the report_token
    UPDATE profile
    SET report_token = report_token - 1
    WHERE user_id = auth.uid();
  END IF;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION insert_notify_and_unapprove() 
RETURNS trigger
LANGUAGE plpgsql
AS $$
  DECLARE
    reported_submission submission%ROWTYPE;
    current_id int4;
    user_id_for_notif uuid;
  BEGIN
    -- first, we need to get the submission data based on NEW.submission_id
    SELECT *
    FROM submission
    INTO reported_submission
    WHERE id = NEW.submission_id;

    -- next, let's verify that the submission's profile is authenticated
    SELECT user_id into user_id_for_notif
    FROM profile
    WHERE id = reported_submission.profile_id;

    -- if the submission being updated belongs to an authenticated user, we need to send a REPORT notification
    IF user_id_for_notif IS NOT NULL then
      -- now, get the profile id of the user who created report; we should only notify if current_id <> reported_submission.profile_id
      current_id := get_profile_id();
      IF current_id <> reported_submission.profile_id THEN
        INSERT INTO notification (submission_id, game_id, level_id, category, score, tas, record, profile_id, creator_id, notif_type, message, report_id)
        VALUES (NEW.submission_id, reported_submission.game_id, reported_submission.level_id, reported_submission.category, reported_submission.score, reported_submission.tas, reported_submission.record, reported_submission.profile_id, current_id, 'report', NEW.message, NEW.report_date);
      END IF;
    END IF;
    
    -- finally, let's unapprove the submission, if it was approved
    DELETE from approve
    WHERE submission_id = NEW.submission_id;

    RETURN NEW;
  END;
$$;

---- ADD `mod_note` ATTRIBUTE TO `submission` TABLE -----

-- STEP 1: ADD ATTRIBUTE
ALTER TABLE submission
ADD COLUMN mod_note VARCHAR(100) NOT NULL DEFAULT '';

-- STEP 2: GRANT UPDATE ACCESS TO NEW ATTRIBUTE
REVOKE UPDATE
ON TABLE submission 
FROM authenticated;

GRANT UPDATE (region_id, submitted_at, monkey_id, proof, comment, live, platform_id, tas, mod_note)
ON TABLE submission 
TO authenticated;

-- STEP 3: RESTRICT NORMAL USERS FROM UPDATING NEW ATTRIBUTE
CREATE OR REPLACE FUNCTION has_mod_note_changed(submission_id timestamptz, new_note varchar(100))
RETURNS boolean
LANGUAGE sql
AS $$
  SELECT (
    SELECT mod_note
    FROM submission s
    WHERE s.id = submission_id
  ) IS DISTINCT FROM new_note;
$$;

DROP POLICY "Enable users to update rows they own" ON submission;

CREATE POLICY "Enable users to update rows they own, except mod_note attribute" 
ON submission
FOR UPDATE 
TO authenticated 
USING (
  (profile_id = get_profile_id())
) 
WITH CHECK (
  (profile_id = get_profile_id() AND NOT (has_mod_note_changed(id, mod_note)))
);

-- STEP 4: RESTRICT NORMAL USERS FROM INSERTING NEW ATTRIBUTE
DROP POLICY "Enable normal users to insert their own submissions" ON submission;

CREATE POLICY "Enable normal users to insert their own submissions" 
ON submission 
FOR INSERT 
TO authenticated 
WITH CHECK (profile_id = get_profile_id() AND mod_note::text = ''::text);

-- STEP 5: UPDATE CLIENT-FACING SELECT RPCS TO INCLUDE NEW ATTRIBUTE IN RESULT
CREATE OR REPLACE FUNCTION get_reported(abb text)
RETURNS json
LANGUAGE sql
AS $$
  SELECT COALESCE((json_agg(row_to_json(submissions_row))), '[]'::json)
  FROM (
    SELECT
      s.all_position,
      s.comment,
      s.id,
      (SELECT jsonb_build_object('category', l.category, 'name', l.name, 'timer_type', l.timer_type, 'mode', jsonb_build_object('game', jsonb_build_object('abb', g.abb, 'name', g.name))) FROM level l INNER JOIN mode m ON l.game = m.game AND l.mode = m.name AND l.category = m.category INNER JOIN game g ON m.game = g.abb WHERE l.game = s.game_id AND l.name = s.level_id AND l.category = s.category) AS "level",
      s.live,
      s.mod_note,
      (SELECT row_to_json(monkey_row) FROM (SELECT m.id, m.monkey_name FROM monkey m WHERE m.id = s.monkey_id) AS monkey_row) monkey,
      (SELECT row_to_json(platform_row) FROM (SELECT pl.id, pl.platform_name FROM platform pl WHERE pl.id = s.platform_id) AS platform_row) platform,
      s.position,
      (SELECT row_to_json(profile_row) FROM (SELECT pr.country, pr.id, pr.username FROM profile pr WHERE pr.id = s.profile_id) AS profile_row) profile,
      (SELECT row_to_json(region_row) FROM (SELECT rg.id, rg.region_name FROM region rg WHERE rg.id = s.region_id) AS region_row) region,
      (SELECT jsonb_build_object('creator', jsonb_build_object('country', p.country, 'id', p.id, 'username', p.username), 'message', r.message, 'report_date', r.report_date)) AS "report",
      s.proof,
      s.record,
      s.score,
      s.submitted_at,
      s.tas
    FROM submission s
    INNER JOIN report r ON r.submission_id = s.id
    INNER JOIN profile p ON p.id = r.creator_id
    WHERE s.game_id = abb
    ORDER BY r.report_date
  ) submissions_row
$$;

CREATE OR REPLACE FUNCTION get_unapproved(abb text)
RETURNS json
LANGUAGE sql
AS $$
  SELECT COALESCE((json_agg(row_to_json(submissions_row))), '[]'::json)
  FROM (
    SELECT
      s.all_position,
      s.comment,
      s.id,
      (SELECT jsonb_build_object('category', l.category, 'name', l.name, 'timer_type', l.timer_type, 'mode', jsonb_build_object('game', jsonb_build_object('abb', g.abb, 'name', g.name))) FROM level l INNER JOIN mode m ON l.game = m.game AND l.mode = m.name AND l.category = m.category INNER JOIN game g ON m.game = g.abb WHERE l.game = s.game_id AND l.name = s.level_id AND l.category = s.category) AS "level",
      s.live,
      s.mod_note,
      (SELECT row_to_json(monkey_row) FROM (SELECT m.id, m.monkey_name FROM monkey m WHERE m.id = s.monkey_id) AS monkey_row) monkey,
      (SELECT row_to_json(platform_row) FROM (SELECT pl.id, pl.platform_name FROM platform pl WHERE pl.id = s.platform_id) AS platform_row) platform,
      s.position,
      (SELECT row_to_json(profile_row) FROM (SELECT pr.country, pr.id, pr.username FROM profile pr WHERE pr.id = s.profile_id) AS profile_row) profile,
      (SELECT row_to_json(region_row) FROM (SELECT rg.id, rg.region_name FROM region rg WHERE rg.id = s.region_id) AS region_row) region,
      s.proof,
      s.record,
      s.score,
      s.submitted_at,
      s.tas
    FROM submission s
    LEFT OUTER JOIN approve a ON a.submission_id = s.id
    LEFT OUTER JOIN report r ON r.submission_id = s.id
    WHERE
      (a.approve_date IS NULL) AND
      (r.report_date IS NULL) AND
      (s.game_id = abb)
    ORDER BY s.id
  ) submissions_row
$$;

CREATE OR REPLACE FUNCTION get_chart_submissions(game text, category_name text, level text, is_score boolean) 
RETURNS json
LANGUAGE sql
AS $$
  WITH chart_submissions AS (
    SELECT *
    FROM submission s
    WHERE s.game_id = game AND s.category = category_name AND s.level_id = level AND s.score = is_score
  ),
  ranked_by_profile AS (
    SELECT cs.id, cs.record, cs.live, ROW_NUMBER() OVER (PARTITION BY cs.profile_id ORDER BY cs.submitted_at DESC, cs.id DESC) AS rn
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
      cs.mod_note,
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

-- STEP 6: ADD NEW ATTRIBUTE TO NOTIFICATION TO MATCH
ALTER TABLE notification
ADD COLUMN mod_note VARCHAR(100) NULL;

-- STEP 7: UPDATE `update_notify_and_unapprove` RPC; CODE THAT EXECUTES WHEN MODERATOR UPDATES SUBMISSION
CREATE OR REPLACE FUNCTION update_notify_and_unapprove() 
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  current_id int4;
  user_id_for_notif uuid;
BEGIN
  -- first, let's verify that the submission's profile is authenticated
  SELECT user_id into user_id_for_notif
  FROM profile
  WHERE id = NEW.profile_id;

  -- now, get the profile id of the user performing the UPDATE
  current_id := get_profile_id();

  -- if the submission being updated belongs to an authenticated user, AND the profile_id is not the same as the current_id, we need to send an UPDATE notification
  IF user_id_for_notif IS NOT NULL AND NEW.profile_id <> current_id then
    INSERT INTO notification (submission_id, game_id, level_id, category, score, tas, record, profile_id, creator_id, notif_type, submitted_at, region_id, monkey_id, platform_id, proof, live, comment, mod_note)
    VALUES (NEW.id, NEW.game_id, NEW.level_id, NEW.category, NEW.score, OLD.tas, NEW.record, NEW.profile_id, current_id, 'update', OLD.submitted_at, OLD.region_id, OLD.monkey_id, OLD.platform_id, OLD.proof, OLD.live, OLD.comment, OLD.mod_note);
  END IF;
  
  -- next, let's delete any approval of the submission, if there is one
  DELETE from approve
  WHERE submission_id = NEW.id;

  RETURN NEW;
END;
$$;

CREATE POLICY "Enable admin delete for unapproved submissions" 
ON submission
FOR DELETE
TO authenticated 
USING (
  (
    (
      is_admin()
    )
    AND
    (
      NOT (
        EXISTS ( 
          SELECT 1
          FROM approve
          WHERE (approve.submission_id = submission.id)
        )
      )
    )
  )
);

DROP POLICY "Enable mod updates for unapproved submissions" ON submission;

CREATE POLICY "Enable mod updates for unapproved submissions"
ON submission
FOR UPDATE
TO authenticated
USING (
  (
    (
      is_moderator(game_id)
    )
    AND
    (
      NOT (
        EXISTS ( 
          SELECT 1
          FROM approve
          WHERE (approve.submission_id = submission.id)
        )
      )
    )
  )
)
WITH CHECK (
  (
    (
      is_moderator(game_id)
    )
    AND
    (
      NOT (
        EXISTS ( 
          SELECT 1
          FROM approve
          WHERE (approve.submission_id = submission.id)
        )
      )
    )
  )
);

ALTER POLICY "Insert restrictions [RESTRICTIVE]" ON notification RENAME TO "Enforce receiving profile exists [RESTRICTIVE]";