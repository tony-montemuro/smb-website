ALTER TABLE moderator RENAME TO administrator;

CREATE FUNCTION is_admin()
RETURNS boolean
LANGUAGE sql
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM administrator
        WHERE profile_id = get_profile_id()
    )
$$;