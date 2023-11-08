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
    (submitted_at >= (SELECT release_date FROM game WHERE abb = game_id))
  )
);