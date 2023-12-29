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