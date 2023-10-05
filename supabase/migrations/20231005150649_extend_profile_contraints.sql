ALTER TABLE profile
DROP CONSTRAINT profile_username_length;

ALTER TABLE profile
ADD CONSTRAINT profile_username_format
CHECK (
    (username ~ '^[A-Za-z0-9][\w]{3,19}$')
);

ALTER TABLE profile
DROP CONSTRAINT youtube_handle_length_constraint;

ALTER TABLE profile
ADD CONSTRAINT profile_youtube_handle_format
CHECK (
    ((youtube_handle IS NULL) OR ((youtube_handle)::text = ''::text) OR (youtube_handle ~ '^@[\w.-]{3,30}$'))
);

ALTER TABLE profile
DROP CONSTRAINT profile_discord_check;

ALTER TABLE profile
ADD CONSTRAINT profile_discord_format
CHECK (
    ((discord IS NULL) OR ((discord)::text = ''::text) OR (discord ~ '^(?!.*\.{2})[a-z0-9_.]{2,32}$'))
);

ALTER TABLE profile
DROP CONSTRAINT profile_twitter_handle_check;

ALTER TABLE profile
ADD CONSTRAINT profile_twitter_handle_check
CHECK (
    ((twitter_handle IS NULL) OR ((twitter_handle)::text = ''::text) OR (twitter_handle ~ '^@[\w]{4,15}$'))
);

ALTER TABLE profile
ADD CONSTRAINT profile_twitch_username_check
CHECK (
    ((twitch_username IS NULL) OR ((twitch_username)::text = ''::text) OR (twitch_username ~ '^[a-zA-Z0-9][\w]{1,23}$'))
);

CREATE OR REPLACE FUNCTION validate_video_url(url text)
RETURNS boolean
LANGUAGE sql
AS $$
    SELECT CASE 
        WHEN url ~ '^((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube\.com|youtu.be))(\/(?:[\w\-]+\?v=|embed\/|v\/)?)([\w\-]+)(\S+)?$' THEN TRUE
        WHEN url ~ '^(?:https?:\/\/)?(?:www\.)?(?:twitch\.tv\/(?:videos\/(\d{7,11})(?:\?t=([\dhms]+))?[^\s&]*(?:\?[\w=&-]*)?|[a-zA-Z0-9][\w]{2,24}\/clip\/([a-zA-Z0-9_-]+)(?:\?[\w=&-]*)?)|clips\.twitch\.tv\/([a-zA-Z0-9_-]+))(?:\?[\w=&-]*)?$' THEN TRUE
        WHEN url ~ '^https?:\/\/(?:twitter\.com|x\.com)\/(?:#!\/)?(\w+)\/status(?:es)?\/(\d+)[/\S]*$' THEN TRUE
        ELSE FALSE
    END
$$;

ALTER TABLE profile
ADD CONSTRAINT profile_featured_video_check
CHECK (
    ((featured_video IS NULL) OR (featured_video::text = ''::text) OR (validate_video_url(featured_video)))
);

ALTER TABLE profile
ADD CONSTRAINT profile_video_description_check
CHECK (
    (featured_video IS NOT NULL AND featured_video::text <> ''::text) OR
    (video_description IS NULL OR video_description::text = ''::text)
);