CREATE TABLE temp (
  id INT PRIMARY KEY,
  monkey_name TEXT UNIQUE NOT NULL
);

INSERT INTO temp (id, monkey_name)
SELECT m.id, m.monkey_name
FROM monkey m;

ALTER TABLE game_monkey
DROP CONSTRAINT game_monkey_monkey_fkey;

ALTER TABLE "notification"
DROP CONSTRAINT notification_monkey_id_fk;

ALTER TABLE submission
DROP CONSTRAINT submission_monkey_id_fkey;

DROP TABLE monkey;

ALTER TABLE temp RENAME TO monkey;

ALTER TABLE monkey ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" 
ON monkey 
FOR SELECT 
USING (true);

ALTER TABLE game_monkey
ADD CONSTRAINT game_monkey_monkey_fkey
FOREIGN KEY (monkey) REFERENCES monkey (id);

ALTER TABLE "notification"
ADD CONSTRAINT notification_monkey_id_fk
FOREIGN KEY (monkey_id) REFERENCES monkey (id);

ALTER TABLE submission
ADD CONSTRAINT submission_monkey_id_fkey
FOREIGN KEY (monkey_id) REFERENCES monkey (id);