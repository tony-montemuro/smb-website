CREATE OR REPLACE FUNCTION filterProfilesByInput(user_input text, start integer, num integer)
RETURNS TABLE (
    country text,
    discord text,
    id integer, 
    username text, 
    twitch_username text,
    twitter_handle text, 
    youtube_handle text
)
LANGUAGE sql
AS $$
    SELECT country, discord, id, username, twitch_username, twitter_handle, youtube_handle
    FROM profile
    WHERE username ILIKE '%' || user_input || '%'
    ORDER BY LOWER(username)
    OFFSET start
    LIMIT num
$$;