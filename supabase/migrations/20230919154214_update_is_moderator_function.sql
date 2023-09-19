CREATE FUNCTION is_moderator(abb text)
RETURNS boolean
LANGUAGE sql
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM moderator
        WHERE profile_id = get_profile_id()
    ) OR EXISTS (
        SELECT 1
        FROM game_profile
        WHERE profile = get_profile_id() AND game = abb
    );
$$;