ALTER TABLE profile
ALTER COLUMN discord SET DEFAULT ''::text,
ALTER COLUMN bio SET DEFAULT ''::text,
ALTER COLUMN featured_video SET DEFAULT ''::text,
ALTER COLUMN video_description SET DEFAULT ''::text,
ALTER COLUMN twitter_handle SET DEFAULT ''::text;

ALTER TABLE profile
DROP CONSTRAINT profile_username_format;

ALTER TABLE profile
ADD CONSTRAINT profile_username_format
CHECK (
  username ~ '^[A-Za-z0-9][\w]{2,14}$'::citext
);