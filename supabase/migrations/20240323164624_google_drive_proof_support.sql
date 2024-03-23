CREATE OR REPLACE FUNCTION validate_video_url(url text)
RETURNS boolean
LANGUAGE sql
AS $$
  SELECT CASE 
    WHEN url ~ '^((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube\.com|youtu.be))(\/(?:[\w\-]+\?v=|embed\/|v\/)?)([\w\-]+)(\S+)?$' THEN TRUE
    WHEN url ~ '^(?:https?:\/\/)?(?:www\.)?(?:twitch\.tv\/(?:videos\/(\d{7,11})(?:\?t=([\dhms]+))?[^\s&]*(?:\?[\w=&-]*)?|[a-zA-Z0-9][\w]{2,24}\/clip\/([a-zA-Z0-9_-]+)(?:\?[\w=&-]*)?)|clips\.twitch\.tv\/([a-zA-Z0-9_-]+))(?:\?[\w=&-]*)?$' THEN TRUE
    WHEN url ~ '^(?:https?:\/\/)?(?:www\.)?(?:twitter\.com|x\.com)\/(?:#!\/)?(\w+)\/status(?:es)?\/(\d+)[/\S]*$' THEN TRUE
    WHEN url ~ '^(?:https?:\/\/)?(?:i\.)?(?:www\.)?(?:imgur\.com\/)?(?:a\/)?([a-zA-Z0-9]{7})(?:\.mp4)?$' THEN TRUE
    WHEN url ~ '^(?:https?:\/\/)?drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)(?:\/[^/?]+)?(?:\?.*)?$' THEN TRUE
    ELSE FALSE
  END
$$;