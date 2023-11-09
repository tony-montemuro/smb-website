CREATE TABLE temp (
  id INT PRIMARY KEY,
  rule_name TEXT UNIQUE NOT NULL
);

INSERT INTO temp (id, rule_name)
SELECT r.id, r.rule_name
FROM rule r;

ALTER TABLE game_rule
DROP CONSTRAINT game_rule_rule_fkey;

DROP TABLE rule;

ALTER TABLE temp RENAME TO rule;

ALTER TABLE rule ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" 
ON rule 
FOR SELECT 
USING (true);

ALTER TABLE game_rule
ADD CONSTRAINT game_rule_rule_fkey
FOREIGN KEY (rule) REFERENCES rule (id);