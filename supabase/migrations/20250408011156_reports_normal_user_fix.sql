-- Fix bug causing normal users not being able to submit reports
DROP POLICY "Enable restricted insert access for users" ON notification;
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
        submission.profile_id = notification.profile_id AND
        ((submission.version IS NULL AND notification.version_id IS NULL) OR submission.version = notification.version_id)
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
