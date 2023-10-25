ALTER TABLE post
ADD CONSTRAINT link_and_description_check
CHECK (
  (link IS NULL OR link = ''::text) = (link_description IS NULL OR link_description = ''::text)
);