-- INSERT PERMISSIONS
CREATE POLICY "Enable insert for administrators"
ON category
FOR INSERT
TO authenticated
WITH CHECK (
    (is_admin())
);

CREATE POLICY "Enable insert for administrators"
ON game
FOR INSERT
TO authenticated
WITH CHECK (
    (is_admin())
);

CREATE POLICY "Enable insert for administrators"
ON game_monkey
FOR INSERT
TO authenticated
WITH CHECK (
    (is_admin())
);

CREATE POLICY "Enable insert for administrators"
ON game_platform
FOR INSERT
TO authenticated
WITH CHECK (
    (is_admin())
);

CREATE POLICY "Enable insert for administrators"
ON game_region
FOR INSERT
TO authenticated
WITH CHECK (
    (is_admin())
);

CREATE POLICY "Enable insert for administrators"
ON game_rule
FOR INSERT
TO authenticated
WITH CHECK (
    (is_admin())
);

CREATE POLICY "Enable insert for administrators"
ON level
FOR INSERT
TO authenticated
WITH CHECK (
    (is_admin())
);

CREATE POLICY "Enable insert for administrators"
ON mode
FOR INSERT
TO authenticated
WITH CHECK (
    (is_admin())
);

CREATE POLICY "Enable insert for administrators"
ON monkey
FOR INSERT
TO authenticated
WITH CHECK (
    (is_admin())
);

CREATE POLICY "Enable insert for administrators"
ON platform
FOR INSERT
TO authenticated
WITH CHECK (
    (is_admin())
);

CREATE POLICY "Enable insert for administrators"
ON region
FOR INSERT
TO authenticated
WITH CHECK (
    (is_admin())
);

CREATE POLICY "Enable insert for administrators"
ON rule
FOR INSERT
TO authenticated
WITH CHECK (
    (is_admin())
);