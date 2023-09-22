CREATE POLICY "Enable insert for administrators"
ON game_profile
FOR INSERT
TO authenticated
WITH CHECK (
    (is_admin())
);

CREATE POLICY "Enable delete for administrators"
ON game_profile
FOR DELETE
TO authenticated
USING (
    (is_admin())
);