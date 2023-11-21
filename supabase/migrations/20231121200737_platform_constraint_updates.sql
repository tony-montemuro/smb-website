ALTER TABLE game_platform
DROP CONSTRAINT game_platform_platform_fkey;

ALTER TABLE notification
DROP CONSTRAINT notification_platform_id_fkey;

ALTER TABLE submission
DROP CONSTRAINT submission_platform_id_fkey;

ALTER TABLE platform
DROP CONSTRAINT platform2_pkey;

ALTER TABLE platform
ADD CONSTRAINT platform_pkey PRIMARY KEY (id);

ALTER TABLE game_platform
ADD CONSTRAINT game_platform_platform_fkey FOREIGN KEY (platform) REFERENCES platform (id);

ALTER TABLE notification
ADD CONSTRAINT notification_platform_id_fkey FOREIGN KEY (platform_id) REFERENCES platform (id);

ALTER TABLE submission
ADD CONSTRAINT submission_platform_id_fkey FOREIGN KEY (platform_id) REFERENCES platform (id);

ALTER TABLE platform
DROP CONSTRAINT platform2_name_key;

ALTER TABLE platform
ADD CONSTRAINT platform_name_abb_key UNIQUE (platform_name, platform_abb);