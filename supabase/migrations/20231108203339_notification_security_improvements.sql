DELETE FROM "notification"
WHERE notif_type = 'report'::notif_t;

ALTER TABLE "notification"
ADD COLUMN report_id timestamptz;

ALTER TABLE "notification"
ADD CONSTRAINT notification_report_id_fkey
FOREIGN KEY (report_id)
REFERENCES report(report_date)
ON DELETE CASCADE;

ALTER TABLE "notification"
ADD CONSTRAINT notification_report_constraint
CHECK (
  (notif_type = 'report'::notif_t AND report_id IS NOT NULL) OR (notif_type <> 'report'::notif_t AND report_id IS NULL)
);

CREATE OR REPLACE FUNCTION is_already_notified(id timestamptz)
RETURNS boolean
LANGUAGE sql
AS $$
  SELECT (
    EXISTS (
      SELECT 1
      FROM notification
      WHERE report_id = id
    )
  )
$$;

DROP POLICY IF EXISTS "Enforce receiving profile exists [RESTRICTIVE]" ON "notification";

CREATE POLICY "Insert restrictions [RESTRICTIVE]" 
ON "notification" 
AS RESTRICTIVE
FOR INSERT 
TO authenticated
WITH CHECK (
  (
    EXISTS (SELECT 1 FROM profile WHERE ((profile.id = profile_id) AND (profile.user_id IS NOT NULL)))
  AND
    (creator_id = get_profile_id())
  )
);

DROP POLICY IF EXISTS "Enable restricted insert access for users" ON "notification";

CREATE POLICY "Enable restricted insert access for users" 
ON "notification" 
FOR INSERT 
TO authenticated 
WITH CHECK (
  (
    (notif_type = 'report'::notif_t)
  AND
    EXISTS (
      SELECT 1
      FROM submission
      WHERE (
        submission.id = notification.submission_id AND 
        submission.game_id = notification.game_id AND 
        submission.level_id = notification.level_id AND 
        submission.category = notification.category AND 
        submission.score = notification.score AND
        submission.tas = notification.tas AND
        submission.record = notification.record AND
        submission.profile_id = notification.profile_id
      )
    )
  AND 
    (
      EXISTS (
        SELECT 1
        FROM report
        WHERE ((report.submission_id = notification.submission_id) AND (report.message = notification.message) AND (report.creator_id = notification.creator_id))
      )
    )
  AND
    (
      NOT (is_already_notified(report_id))
    )
  )
);

CREATE OR REPLACE FUNCTION insert_notify_and_unapprove() 
RETURNS trigger
LANGUAGE plpgsql
AS $$
  DECLARE
    current_submission submission%ROWTYPE;
    current_id int4;
    user_id_for_notif uuid;
  BEGIN
    -- first, we need to get the submission data based on NEW.submission_id
    SELECT *
    FROM submission
    INTO current_submission
    WHERE id = NEW.submission_id;

    -- next, let's verify that the submission's profile is authenticated
    SELECT user_id into user_id_for_notif
    FROM profile
    WHERE id = current_submission.profile_id;

    -- if the submission being updated belongs to an authenticated user, we need to send a REPORT notification
    IF user_id_for_notif IS NOT NULL then
      -- now, get the profile id of the user performing the UPDATE
      current_id := get_profile_id();
      
      -- now, we can notify the user of the report
      INSERT INTO notification (submission_id, game_id, level_id, category, score, tas, record, profile_id, creator_id, notif_type, message, report_id)
      VALUES (NEW.submission_id, current_submission.game_id, current_submission.level_id, current_submission.category, current_submission.score, current_submission.tas, current_submission.record, current_submission.profile_id, current_id, 'report', NEW.message, NEW.report_date);
    END IF;
    
    -- finally, let's unapprove the submission, if it was approved
    DELETE from approve
    WHERE submission_id = NEW.submission_id;

    RETURN NEW;
  END;
$$;