DROP POLICY IF EXISTS "Insert restrictions [RESTRICTIVE]" ON submission;

CREATE POLICY "Insert restrictions [RESTRICTIVE]" 
ON submission
AS RESTRICTIVE 
FOR INSERT 
TO authenticated
WITH CHECK (
  (
    (id = now()) 
  AND
    CASE get_chart_type(game_id, level_id)
      WHEN 'both'::text THEN true
      WHEN 'score'::text THEN score
      WHEN 'time'::text THEN (NOT score)
      ELSE false
    END 
  AND
    valid_monkey_platform_region(game_id, monkey_id, platform_id, region_id)
  AND (
      submitted_at >= (SELECT release_date FROM game WHERE abb = game_id) 
      OR 
      (SELECT custom FROM game WHERE abb = game_id)
    )
  )
);

DROP POLICY IF EXISTS "Update restrictions [RESTRICTIVE]" ON submission;

CREATE POLICY "Update restrictions [RESTRICTIVE]"
ON submission 
AS RESTRICTIVE 
FOR UPDATE 
TO authenticated 
USING (true) 
WITH CHECK (
  (
    valid_monkey_platform_region(game_id, monkey_id, platform_id, region_id)
  AND
    (
      submitted_at >= (SELECT release_date FROM game WHERE abb = game_id) 
      OR 
      (SELECT custom FROM game WHERE abb = game_id)
    )
  )
);