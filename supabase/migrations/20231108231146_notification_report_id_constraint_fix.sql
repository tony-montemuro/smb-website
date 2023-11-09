ALTER TABLE "notification"
DROP CONSTRAINT notification_report_id_fkey;

ALTER TABLE "notification"
ADD CONSTRAINT notification_report_id_fkey
FOREIGN KEY (report_id)
REFERENCES report(report_date)
ON DELETE SET NULL;

ALTER TABLE "notification"
DROP CONSTRAINT notification_report_constraint;

ALTER TABLE "notification"
ADD CONSTRAINT notification_report_constraint
CHECK (
  (notif_type = 'report'::notif_t) OR (notif_type <> 'report'::notif_t AND report_id IS NULL)
);