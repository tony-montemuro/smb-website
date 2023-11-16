ALTER TABLE profile
DROP CONSTRAINT profile_username_format;

ALTER TABLE profile
ADD CONSTRAINT profile_username_format
CHECK (
  username ~ '^[A-Za-z0-9][\w]{2,15}$'::citext
);