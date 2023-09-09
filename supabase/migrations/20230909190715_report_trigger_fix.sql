DROP TRIGGER IF EXISTS report_after_insert_trigger ON report;

CREATE TRIGGER report_after_insert_trigger
AFTER INSERT ON report
FOR EACH ROW
EXECUTE FUNCTION insert_notify_and_unapprove();