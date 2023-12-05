
SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

CREATE EXTENSION IF NOT EXISTS "pg_cron" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "pgsodium" WITH SCHEMA "pgsodium";

ALTER SCHEMA "public" OWNER TO "postgres";

CREATE EXTENSION IF NOT EXISTS "moddatetime" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";

CREATE EXTENSION IF NOT EXISTS "pg_stat_monitor" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";

CREATE TYPE "public"."category_t" AS ENUM (
    'main',
    'misc',
    'normal',
    'story',
    'challenge',
    'party'
);

ALTER TYPE "public"."category_t" OWNER TO "postgres";

CREATE TYPE "public"."chart_t" AS ENUM (
    'score',
    'time',
    'both'
);

ALTER TYPE "public"."chart_t" OWNER TO "postgres";

CREATE TYPE "public"."continents" AS ENUM (
    'Africa',
    'Antarctica',
    'Asia',
    'Europe',
    'Oceania',
    'North America',
    'South America'
);

ALTER TYPE "public"."continents" OWNER TO "postgres";

CREATE TYPE "public"."notif_t" AS ENUM (
    'insert',
    'delete',
    'report',
    'approve',
    'update'
);

ALTER TYPE "public"."notif_t" OWNER TO "postgres";

CREATE TYPE "public"."timer_t" AS ENUM (
    'sec',
    'sec_csec',
    'min',
    'min_sec',
    'min_sec_csec',
    'hour',
    'hour_min',
    'hour_min_sec',
    'hour_min_sec_csec'
);

ALTER TYPE "public"."timer_t" OWNER TO "postgres";

CREATE TYPE "public"."type_t" AS ENUM (
    'score',
    'time'
);

ALTER TYPE "public"."type_t" OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."approve_notify"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$DECLARE
  current_submission submission%ROWTYPE;
  current_id int4;
  user_id_for_notif uuid;
BEGIN
  -- first, initialize the current_submission variable
  SELECT * into current_submission
  FROM submission
  WHERE id = NEW.submission_id;

  -- next, let's verify that the submission's profile is authenticated
  SELECT user_id into user_id_for_notif
  FROM profile
  WHERE id = current_submission.profile_id;

  -- if the user is authenticated, we can proceed
  IF user_id_for_notif IS NOT NULL then
    -- mow, initialize the current_id variable
    current_id := get_profile_id();

    -- Only proceed if the current_id is NOT the same as the profile_id of the submission
    IF current_id <> current_submission.profile_id THEN
      -- then, create our notification and insert it
      INSERT INTO notification (submission_id, game_id, level_id, category, score, tas, record, profile_id, creator_id, notif_type)
      VALUES (NEW.submission_id, current_submission.game_id, current_submission.level_id, current_submission.category, current_submission.score, current_submission.tas, current_submission.record, current_submission.profile_id,current_id, 'approve');
    END IF;
  END IF;

  RETURN NEW;

END;$$;

ALTER FUNCTION "public"."approve_notify"() OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."approve_submission"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  current_id int4;
  submission_exists boolean;
BEGIN
  -- first, define current_id as the current users' profile id
  current_id := get_profile_id();

  -- next, initialize submission_exists
  submission_exists := EXISTS (
    SELECT 1
    FROM submission
    WHERE id = OLD.submission_id
  );

  -- If the submission DOES exist => user wants to approve submission
  -- If the submission DOES NOT exist => report is being deleted due to the `delete cascade` effect, and we do NOT want to approve a non-existant submission
  -- Thus, if `submission_exists`, let's do the approval
  IF submission_exists THEN
    -- Approve of the reported submission
    INSERT INTO approve (approve_date, submission_id, creator_id)
    VALUES (NOW(), OLD.submission_id, current_id);
  END IF;

  RETURN OLD;
END;
$$;

ALTER FUNCTION "public"."approve_submission"() OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."decrement_report_token"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$BEGIN
  -- Check if the profile has greater than 0 report tokens
  IF (SELECT report_token FROM profile WHERE user_id = auth.uid()) <= 0 THEN
    RAISE EXCEPTION 'You have ran out of reports for the day. Try again tomorrow.';
  END IF;

  -- Decrement the report_token
  UPDATE profile
  SET report_token = report_token - 1
  WHERE user_id = auth.uid();

  RETURN NEW;
END;$$;

ALTER FUNCTION "public"."decrement_report_token"() OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."get_chart_type"("game_id" "text", "level_id" "text") RETURNS "text"
    LANGUAGE "plpgsql"
    AS $$DECLARE
  chart_type text;
BEGIN
  SELECT l.chart_type INTO chart_type
  FROM level l
  WHERE l.game = game_id AND l.name = level_id;

  RETURN chart_type;
END;$$;

ALTER FUNCTION "public"."get_chart_type"("game_id" "text", "level_id" "text") OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";

CREATE TABLE IF NOT EXISTS "public"."submission" (
    "id" timestamp with time zone DEFAULT "now"() NOT NULL,
    "game_id" "text" NOT NULL,
    "level_id" "text" NOT NULL,
    "category" "public"."category_t" NOT NULL,
    "profile_id" integer NOT NULL,
    "score" boolean NOT NULL,
    "tas" boolean NOT NULL,
    "record" double precision NOT NULL,
    "submitted_at" timestamp with time zone NOT NULL,
    "monkey_id" integer NOT NULL,
    "platform_id" integer NOT NULL,
    "region_id" integer NOT NULL,
    "proof" "text" NOT NULL,
    "comment" character varying(100) NOT NULL,
    "live" boolean NOT NULL,
    "position" integer,
    "all_position" integer NOT NULL,
    CONSTRAINT "submission_submitted_at_check" CHECK (("submitted_at" <= "now"()))
);

ALTER TABLE "public"."submission" OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."get_position"("newrecord" "public"."submission", "liveonly" boolean) RETURNS integer
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  submissions CURSOR FOR
    SELECT s2.record
    FROM submission s2
    JOIN (
      SELECT profile_id, MAX(submitted_at) AS max_submitted_at
      FROM submission
      WHERE game_id = newRecord.game_id
        AND level_id = newRecord.level_id
        AND category = newRecord.category
        AND score = newRecord.score
        AND profile_id <> (get_profile_id())
        AND tas = newRecord.tas
        AND (NOT liveOnly OR live = TRUE)
      GROUP BY profile_id
    ) latest_submissions ON s2.profile_id = latest_submissions.profile_id AND s2.submitted_at = latest_submissions.max_submitted_at
    WHERE game_id = newRecord.game_id
      AND level_id = newRecord.level_id
      AND category = newRecord.category
      AND score = newRecord.score
      AND s2.profile_id <> (get_profile_id())
      AND tas = newRecord.tas
      AND (NOT liveOnly OR live = TRUE)
    ORDER BY s2.record DESC;

  prevRecord FLOAT8 := 1.7976931348623157E308;
  trueCount INTEGER := 1;
  posCount INTEGER := 1;
BEGIN
  FOR submission IN submissions LOOP
    -- If current record is less than previous record, update posCount
    IF submission.record < prevRecord THEN
      posCount := trueCount;
    END IF;

    -- If current record is less than or equal, then return posCount
    IF submission.record <= newRecord.record THEN
      RETURN posCount;
    END IF;

    -- update trueCount and prevRecord
    trueCount := trueCount + 1;
    prevRecord := submission.record;

  END LOOP;

  -- If the loop completes, just return trueCount
  RETURN trueCount;
END;
$$;

ALTER FUNCTION "public"."get_position"("newrecord" "public"."submission", "liveonly" boolean) OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."get_profile_id"() RETURNS integer
    LANGUAGE "sql"
    AS $$SELECT id
FROM profile
WHERE user_id = auth.uid();$$;

ALTER FUNCTION "public"."get_profile_id"() OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."get_profiles"() RETURNS "json"
    LANGUAGE "plpgsql"
    AS $$BEGIN
  RETURN (
    SELECT json_agg(row_to_json(profiles_row))
    FROM (
      SELECT
        bio,
        birthday,
        (SELECT row_to_json(country_row) FROM (SELECT c.iso2, c.name FROM countries c WHERE c.iso2 = p.country) AS country_row) country,
        discord,
        featured_video,
        id,
        (SELECT array_agg(DISTINCT s.game_id) AS submitted_games FROM submission s WHERE s.profile_id = p.id GROUP BY s.profile_id),
        twitch_username,
        twitter_handle,
        username,
        video_description,
        youtube_handle
      FROM profile p
      ORDER BY LOWER(username)
    ) profiles_row
  );
END$$;

ALTER FUNCTION "public"."get_profiles"() OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."get_unapproved"() RETURNS "json"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  RETURN (
    select json_agg(row_to_json(submissions_row))
    from (
      select
        all_position,
        comment,
        id,
        (SELECT jsonb_build_object('category', l.category, 'name', l.name, 'timer_type', l.timer_type, 'mode', jsonb_build_object('game', jsonb_build_object('abb', g.abb, 'name', g.name))) FROM level l INNER JOIN mode m ON l.game = m.game AND l.mode = m.name AND l.category = m.category INNER JOIN game g ON m.game = g.abb WHERE l.game = s.game_id AND l.name = s.level_id AND l.category = s.category) AS "level",
        live,
        (select row_to_json(monkey_row) from (select m.id, m.monkey_name from monkey m where m.id = s.monkey_id) as monkey_row) monkey,
        (select row_to_json(platform_row) from (select pl.id, pl.platform_name from platform pl where pl.id = s.platform_id) as platform_row) platform,
        position,
        (select row_to_json(profile_row) from (select pr.country, pr.id, pr.username from profile pr where pr.id = s.profile_id) as profile_row) profile,
        (select row_to_json(region_row) from (select rg.id, rg.region_name from region rg where rg.id = s.region_id) as region_row) region,
        (SELECT jsonb_build_object('creator', jsonb_build_object('country', p.country, 'id', p.id, 'username', p.username), 'message', rp.message, 'report_date', rp.report_date) FROM report rp INNER JOIN profile p ON rp.creator_id = p.id WHERE rp.submission_id = s.id) AS "report",
        proof,
        record,
        score,
        submitted_at,
        tas
      from submission s
      where (select approve_date from approve a where a.submission_id = s.id) IS NULL
    ) submissions_row
  );
END;
$$;

ALTER FUNCTION "public"."get_unapproved"() OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."insert_notify"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  current_id int4;
  user_id_for_notif uuid;
BEGIN
  -- first, let's verify that the submission's profile is authenticated
  SELECT user_id into user_id_for_notif
  FROM profile
  WHERE id = NEW.profile_id;

  -- now, get the profile id of the user performing the UPDATE
  current_id := get_profile_id();

  -- if the submission being updated belongs to an authenticated user, AND the profile_id is not the same as the current_id, we need to send an INSERT notification
  IF user_id_for_notif IS NOT NULL AND NEW.profile_id <> current_id then
    INSERT INTO notification (submission_id, game_id, level_id, category, score, tas, record, profile_id, creator_id, notif_type)
    VALUES (NEW.id, NEW.game_id, NEW.level_id, NEW.category, NEW.score, NEW.tas, NEW.record, NEW.profile_id, current_id, 'insert');
  END IF;

  RETURN NEW;
END;$$;

ALTER FUNCTION "public"."insert_notify"() OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."insert_notify_and_unapprove"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  current_submission submission%ROWTYPE;
  current_id int4;
  user_id_for_notif uuid;
BEGIN
  -- first, we need to get the submission data based on NEW.submission_id
  SELECT *
  FROM submission
  INTO current_submission
  WHERE id = NEW.submission_id;

  -- next, let's verify that the submission's profile is authenticated
  SELECT user_id into user_id_for_notif
  FROM profile
  WHERE id = current_submission.profile_id;

  -- if the submission being updated belongs to an authenticated user, we need to send a REPORT notification
  IF user_id_for_notif IS NOT NULL then
    -- now, get the profile id of the user performing the UPDATE
    current_id := get_profile_id();
    
    -- now, we can notify the user of the report
    INSERT INTO notification (submission_id, game_id, level_id, category, score, tas, record, profile_id, creator_id, notif_type, message)
    VALUES (NEW.submission_id, current_submission.game_id, current_submission.level_id, current_submission.category, current_submission.score, current_submission.tas, current_submission.record, current_submission.profile_id, current_id, 'report', NEW.message);
  END IF;
  
  -- finally, let's unapprove the submission, if it was approved
  DELETE from approve
  WHERE submission_id = NEW.submission_id;

  RETURN NEW;
END;
$$;

ALTER FUNCTION "public"."insert_notify_and_unapprove"() OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."is_moderator"() RETURNS boolean
    LANGUAGE "plpgsql"
    AS $$BEGIN
  RETURN EXISTS ( 
    SELECT 1
    FROM moderator
    JOIN profile ON moderator.profile_id = profile.id
    WHERE profile.user_id = auth.uid()
  );
END;$$;

ALTER FUNCTION "public"."is_moderator"() OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."prepare_submission"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$DECLARE
  negative_transform boolean;
  level_timer_type public.timer_t;
  old_submission_date timestamptz;
BEGIN
  -- First, we store the time_ascending attribute for the level of the submission in the `negative_transform` variable, and the timer_type attribute for the level of the submission in the `level_timer_type` variable
  SELECT time_ascending, timer_type
  INTO negative_transform, level_timer_type
  FROM level l
  WHERE l.game = NEW.game_id AND l.name = NEW.level_id AND l.category = NEW.category;

  -- Next, we need to store the submission date of the previous submission, if it exists
  SELECT submitted_at into old_submission_date
  FROM submission s
  WHERE (s.game_id = NEW.game_id AND
    s.level_id = NEW.level_id AND
    s.category = NEW.category AND
    s.profile_id = NEW.profile_id AND
    s.score = NEW.score AND
    s.tas = NEW.tas)
  ORDER BY submitted_at DESC
  LIMIT 1;

  -- Next, if the submission is for a time chart, let's perform any necessary record modifications based on both the `negative_transform` and `level_timer_time`
  IF NOT new.score THEN
    -- Apply any transformations based on the `level_timer_type` variable
    IF NOT (level_timer_type IN ('sec_csec', 'min_sec_csec', 'hour_min_sec_csec')) THEN
      NEW.record := FLOOR(NEW.record); -- Round down to the nearest second
    END IF;
    
    IF level_timer_type IN ('min', 'hour', 'hour_min') THEN
      NEW.record := (FLOOR(NEW.record / 60)) * 60::float8; -- Round down to nearest minute
    END IF;
    
    IF level_timer_type = 'hour' THEN
      NEW.record := (FLOOR(NEW.record / 3600)) * 3600::float8; -- Round down to nearest hour
    END IF;

    -- Apply any transformations based on the `negative_transform` variable
    IF negative_transform THEN
      NEW.record := NEW.record * (-1); --negate the record attribute
    END IF;
  END IF;

  -- Next, let's update the submitted_at field, if necessary
  IF NEW.submitted_at = old_submission_date THEN
    NEW.submitted_at := NEW.submitted_at + interval '1 millisecond';
  END IF;

  -- Set the all_position in the submission table
  NEW.all_position := get_position(NEW, FALSE);

  -- Set the position in the submission table if live is true
  IF NEW.live = true THEN
    NEW.position := get_position(NEW, TRUE);
  ELSE
    NEW.position := null;
  END IF;

  RETURN NEW;
END;$$;

ALTER FUNCTION "public"."prepare_submission"() OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."regulate_report_token"("report_token" integer) RETURNS boolean
    LANGUAGE "sql"
    AS $$WITH old AS (
  SELECT p.report_token
  FROM profile p
  WHERE (p.user_id = auth.uid())
)
SELECT (
  ((SELECT report_token FROM old) IS NOT DISTINCT FROM report_token) 
OR 
  ((SELECT report_token FROM old) > 0) AND (report_token = (SELECT report_token FROM old) - 1)
)$$;

ALTER FUNCTION "public"."regulate_report_token"("report_token" integer) OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."report_exists"("s_id" timestamp with time zone) RETURNS boolean
    LANGUAGE "sql"
    AS $$SELECT EXISTS (
  SELECT 1
  FROM report
  WHERE submission_id = s_id
  LIMIT 1
);$$;

ALTER FUNCTION "public"."report_exists"("s_id" timestamp with time zone) OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."update_notify_and_unapprove"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  current_id int4;
  user_id_for_notif uuid;
BEGIN
  -- first, let's verify that the submission's profile is authenticated
  SELECT user_id into user_id_for_notif
  FROM profile
  WHERE id = NEW.profile_id;

  -- now, get the profile id of the user performing the UPDATE
  current_id := get_profile_id();

  -- if the submission being updated belongs to an authenticated user, AND the profile_id is not the same as the current_id, we need to send an UPDATE notification
  IF user_id_for_notif IS NOT NULL AND NEW.profile_id <> current_id then
    INSERT INTO notification (submission_id, game_id, level_id, category, score, tas, record, profile_id, creator_id, notif_type, submitted_at, region_id, monkey_id, platform_id, proof, live, comment)
    VALUES (NEW.id, NEW.game_id, NEW.level_id, NEW.category, NEW.score, OLD.tas, NEW.record, NEW.profile_id, current_id, 'update', OLD.submitted_at, OLD.region_id, OLD.monkey_id, OLD.platform_id, OLD.proof, OLD.live, OLD.comment);
  END IF;
  
  -- next, let's delete any approval of the submission, if there is one
  DELETE from approve
  WHERE submission_id = NEW.id;

  RETURN NEW;
END;
$$;

ALTER FUNCTION "public"."update_notify_and_unapprove"() OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."valid_monkey_platform_region"("game_id" "text", "monkey_id" integer, "platform_id" integer, "region_id" integer) RETURNS boolean
    LANGUAGE "sql"
    AS $$SELECT (
  EXISTS ( 
    SELECT 1
    FROM game_monkey gm
    WHERE ((gm.game = game_id) AND (gm.monkey = monkey_id))
  )
  AND
  EXISTS ( 
    SELECT 1
    FROM game_platform gp
    WHERE ((gp.game = game_id) AND (gp.platform = platform_id))
  )
  AND
  EXISTS (
    SELECT 1
    FROM game_region gr
    WHERE ((gr.game = game_id) AND (gr.region = region_id))
  )
);$$;

ALTER FUNCTION "public"."valid_monkey_platform_region"("game_id" "text", "monkey_id" integer, "platform_id" integer, "region_id" integer) OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."approve" (
    "approve_date" timestamp with time zone DEFAULT "now"() NOT NULL,
    "submission_id" timestamp with time zone NOT NULL,
    "creator_id" integer NOT NULL,
    CONSTRAINT "approve_approve_date_check" CHECK (("approve_date" = "now"()))
);

ALTER TABLE "public"."approve" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."countries" (
    "name" "text",
    "iso2" "text" NOT NULL
);

ALTER TABLE "public"."countries" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."game" (
    "abb" "text" NOT NULL,
    "name" "text" NOT NULL,
    "custom" boolean NOT NULL,
    "id" integer NOT NULL,
    "release_date" "date",
    "creator" integer,
    "download" "text",
    "live_preference" boolean NOT NULL
);

ALTER TABLE "public"."game" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."game_monkey" (
    "game" "text" NOT NULL,
    "monkey" integer NOT NULL
);

ALTER TABLE "public"."game_monkey" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."game_platform" (
    "game" "text" NOT NULL,
    "platform" integer NOT NULL
);

ALTER TABLE "public"."game_platform" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."game_region" (
    "game" "text" NOT NULL,
    "region" integer NOT NULL
);

ALTER TABLE "public"."game_region" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."game_rule" (
    "abb" "text" NOT NULL,
    "rule" integer NOT NULL,
    "id" integer NOT NULL
);

ALTER TABLE "public"."game_rule" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."level" (
    "id" integer NOT NULL,
    "game" "text" NOT NULL,
    "mode" "text" NOT NULL,
    "name" "text" NOT NULL,
    "chart_type" "public"."chart_t" NOT NULL,
    "time" real NOT NULL,
    "category" "public"."category_t" NOT NULL,
    "time_ascending" boolean DEFAULT false NOT NULL,
    "timer_type" "public"."timer_t"
);

ALTER TABLE "public"."level" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."mode" (
    "game" "text" NOT NULL,
    "name" "text" NOT NULL,
    "id" integer,
    "category" "public"."category_t" NOT NULL
);

ALTER TABLE "public"."mode" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."moderator" (
    "profile_id" integer NOT NULL
);

ALTER TABLE "public"."moderator" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."monkey" (
    "id" bigint NOT NULL,
    "monkey_name" character varying NOT NULL
);

ALTER TABLE "public"."monkey" OWNER TO "postgres";

ALTER TABLE "public"."monkey" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."monkey_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

CREATE TABLE IF NOT EXISTS "public"."notification" (
    "message" character varying(100),
    "submission_id" timestamp with time zone,
    "notif_date" timestamp with time zone DEFAULT "now"() NOT NULL,
    "game_id" "text" NOT NULL,
    "level_id" "text" NOT NULL,
    "score" boolean NOT NULL,
    "record" double precision,
    "profile_id" integer NOT NULL,
    "creator_id" integer NOT NULL,
    "notif_type" "public"."notif_t" NOT NULL,
    "submitted_at" timestamp with time zone,
    "region_id" integer,
    "monkey_id" integer,
    "proof" "text",
    "live" boolean,
    "comment" "text",
    "category" "public"."category_t" NOT NULL,
    "platform_id" integer,
    "tas" boolean NOT NULL
);

ALTER TABLE "public"."notification" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."platform" (
    "id" integer NOT NULL,
    "platform_name" "text" NOT NULL,
    "platform_abb" "text" NOT NULL
);

ALTER TABLE "public"."platform" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."post" (
    "id" integer NOT NULL,
    "title" character varying(200) NOT NULL,
    "body" character varying(3000) NOT NULL,
    "posted_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "link" character varying(256),
    "profile_id" integer NOT NULL,
    "link_description" character varying(100),
    CONSTRAINT "post_body_check" CHECK ((("body")::"text" <> ''::"text")),
    CONSTRAINT "post_posted_at_check" CHECK (("posted_at" <= "now"())),
    CONSTRAINT "post_title_check" CHECK ((("title")::"text" <> ''::"text"))
);

ALTER TABLE "public"."post" OWNER TO "postgres";

CREATE SEQUENCE IF NOT EXISTS "public"."post_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER TABLE "public"."post_id_seq" OWNER TO "postgres";

ALTER SEQUENCE "public"."post_id_seq" OWNED BY "public"."post"."id";

CREATE TABLE IF NOT EXISTS "public"."profile" (
    "id" integer NOT NULL,
    "user_id" "uuid",
    "username" character varying(25) NOT NULL,
    "youtube_handle" character varying(31) DEFAULT ''::"text",
    "twitch_username" character varying(25) DEFAULT ''::"text",
    "country" "text",
    "discord" character varying(32),
    "bio" character varying(200),
    "birthday" "date",
    "featured_video" "text",
    "video_description" character varying(200),
    "twitter_handle" character varying(16),
    "report_token" integer DEFAULT 10 NOT NULL,
    CONSTRAINT "check_birthday_range" CHECK ((("birthday" >= '1900-01-01'::"date") AND ("birthday" <= CURRENT_DATE))),
    CONSTRAINT "profile_discord_check" CHECK (((("char_length"(("discord")::"text") >= 2) AND ("char_length"(("discord")::"text") <= 32)) OR (("discord" IS NULL) OR (("discord")::"text" = ''::"text")))),
    CONSTRAINT "profile_twitter_handle_check" CHECK ((("twitter_handle" IS NULL) OR (("twitter_handle")::"text" = ''::"text") OR (("char_length"(("twitter_handle")::"text") >= 5) AND ("char_length"(("twitter_handle")::"text") <= 16)))),
    CONSTRAINT "profile_username_length" CHECK (("char_length"(("username")::"text") >= 4)),
    CONSTRAINT "youtube_handle_length_constraint" CHECK ((("youtube_handle" IS NULL) OR (("youtube_handle")::"text" = ''::"text") OR (("char_length"(("youtube_handle")::"text") >= 4) AND ("char_length"(("youtube_handle")::"text") <= 31))))
);

ALTER TABLE "public"."profile" OWNER TO "postgres";

CREATE SEQUENCE IF NOT EXISTS "public"."profile_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER TABLE "public"."profile_id_seq" OWNER TO "postgres";

ALTER SEQUENCE "public"."profile_id_seq" OWNED BY "public"."profile"."id";

CREATE TABLE IF NOT EXISTS "public"."region" (
    "id" integer NOT NULL,
    "region_name" "text" NOT NULL
);

ALTER TABLE "public"."region" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."report" (
    "report_date" timestamp with time zone DEFAULT "now"() NOT NULL,
    "submission_id" timestamp with time zone NOT NULL,
    "message" character varying(100) NOT NULL,
    "creator_id" integer NOT NULL
);

ALTER TABLE "public"."report" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."rule" (
    "id" integer NOT NULL,
    "rule_name" "text" NOT NULL
);

ALTER TABLE "public"."rule" OWNER TO "postgres";

CREATE SEQUENCE IF NOT EXISTS "public"."rule_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER TABLE "public"."rule_id_seq" OWNER TO "postgres";

ALTER SEQUENCE "public"."rule_id_seq" OWNED BY "public"."rule"."id";

ALTER TABLE ONLY "public"."post" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."post_id_seq"'::"regclass");

ALTER TABLE ONLY "public"."profile" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."profile_id_seq"'::"regclass");

ALTER TABLE ONLY "public"."rule" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."rule_id_seq"'::"regclass");

ALTER TABLE ONLY "public"."approve"
    ADD CONSTRAINT "approve_pkey" PRIMARY KEY ("approve_date");

ALTER TABLE ONLY "public"."approve"
    ADD CONSTRAINT "approve_unique_submission" UNIQUE ("submission_id");

ALTER TABLE ONLY "public"."countries"
    ADD CONSTRAINT "countries_pkey" PRIMARY KEY ("iso2");

ALTER TABLE ONLY "public"."game"
    ADD CONSTRAINT "game_pkey" PRIMARY KEY ("abb");

ALTER TABLE ONLY "public"."level"
    ADD CONSTRAINT "level_pkey" PRIMARY KEY ("game", "name", "category");

ALTER TABLE ONLY "public"."mode"
    ADD CONSTRAINT "mode_pkey" PRIMARY KEY ("game", "name", "category");

ALTER TABLE ONLY "public"."moderator"
    ADD CONSTRAINT "moderator_pkey" PRIMARY KEY ("profile_id");

ALTER TABLE ONLY "public"."monkey"
    ADD CONSTRAINT "monkey_name_key" UNIQUE ("monkey_name");

ALTER TABLE ONLY "public"."monkey"
    ADD CONSTRAINT "monkey_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."notification"
    ADD CONSTRAINT "notification_pkey1" PRIMARY KEY ("notif_date");

ALTER TABLE ONLY "public"."platform"
    ADD CONSTRAINT "platform2_name_key" UNIQUE ("platform_name");

ALTER TABLE ONLY "public"."platform"
    ADD CONSTRAINT "platform2_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."post"
    ADD CONSTRAINT "post_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."profile"
    ADD CONSTRAINT "profile_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."profile"
    ADD CONSTRAINT "profile_user_id_key" UNIQUE ("user_id");

ALTER TABLE ONLY "public"."profile"
    ADD CONSTRAINT "profile_username_key" UNIQUE ("username");

ALTER TABLE ONLY "public"."region"
    ADD CONSTRAINT "region_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."report"
    ADD CONSTRAINT "report_pkey" PRIMARY KEY ("report_date");

ALTER TABLE ONLY "public"."report"
    ADD CONSTRAINT "report_unique_submission" UNIQUE ("submission_id");

ALTER TABLE ONLY "public"."rule"
    ADD CONSTRAINT "rule_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."submission"
    ADD CONSTRAINT "submission_pkey" PRIMARY KEY ("id");

CREATE TRIGGER "approve_after_insert_trigger" AFTER INSERT ON "public"."approve" FOR EACH ROW EXECUTE FUNCTION "public"."approve_notify"();

CREATE TRIGGER "report_after_delete_trigger" AFTER DELETE ON "public"."report" FOR EACH ROW EXECUTE FUNCTION "public"."approve_submission"();

CREATE TRIGGER "report_after_insert_trigger" AFTER INSERT ON "public"."report" FOR EACH ROW EXECUTE FUNCTION "public"."insert_notify"();

CREATE TRIGGER "report_before_insert_trigger" BEFORE INSERT ON "public"."report" FOR EACH ROW EXECUTE FUNCTION "public"."decrement_report_token"();

CREATE TRIGGER "submission_after_insert_trigger" AFTER INSERT ON "public"."submission" FOR EACH ROW EXECUTE FUNCTION "public"."insert_notify"();

CREATE TRIGGER "submission_after_update_trigger" AFTER UPDATE ON "public"."submission" FOR EACH ROW EXECUTE FUNCTION "public"."update_notify_and_unapprove"();

CREATE TRIGGER "submission_before_insert_trigger" BEFORE INSERT ON "public"."submission" FOR EACH ROW EXECUTE FUNCTION "public"."prepare_submission"();

ALTER TABLE ONLY "public"."approve"
    ADD CONSTRAINT "approve_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "public"."profile"("id");

ALTER TABLE ONLY "public"."approve"
    ADD CONSTRAINT "approve_submission_fk" FOREIGN KEY ("submission_id") REFERENCES "public"."submission"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."game"
    ADD CONSTRAINT "game_creator_fkey" FOREIGN KEY ("creator") REFERENCES "public"."profile"("id");

ALTER TABLE ONLY "public"."game_monkey"
    ADD CONSTRAINT "game_monkey_game_fkey" FOREIGN KEY ("game") REFERENCES "public"."game"("abb");

ALTER TABLE ONLY "public"."game_monkey"
    ADD CONSTRAINT "game_monkey_monkey_fkey" FOREIGN KEY ("monkey") REFERENCES "public"."monkey"("id");

ALTER TABLE ONLY "public"."game_platform"
    ADD CONSTRAINT "game_platform_game_fkey" FOREIGN KEY ("game") REFERENCES "public"."game"("abb");

ALTER TABLE ONLY "public"."game_platform"
    ADD CONSTRAINT "game_platform_platform_fkey" FOREIGN KEY ("platform") REFERENCES "public"."platform"("id");

ALTER TABLE ONLY "public"."game_region"
    ADD CONSTRAINT "game_region_game_fkey" FOREIGN KEY ("game") REFERENCES "public"."game"("abb");

ALTER TABLE ONLY "public"."game_region"
    ADD CONSTRAINT "game_region_region_fkey" FOREIGN KEY ("region") REFERENCES "public"."region"("id");

ALTER TABLE ONLY "public"."game_rule"
    ADD CONSTRAINT "game_rule_abb_fkey" FOREIGN KEY ("abb") REFERENCES "public"."game"("abb");

ALTER TABLE ONLY "public"."game_rule"
    ADD CONSTRAINT "game_rule_rule_fkey" FOREIGN KEY ("rule") REFERENCES "public"."rule"("id");

ALTER TABLE ONLY "public"."game_rule"
    ADD CONSTRAINT "unique_game_id" UNIQUE (abb, id);

ALTER TABLE ONLY "public"."level"
    ADD CONSTRAINT "levelfk" FOREIGN KEY ("game", "mode", "category") REFERENCES "public"."mode"("game", "name", "category") MATCH FULL;

ALTER TABLE ONLY "public"."mode"
    ADD CONSTRAINT "mode_game_fkey" FOREIGN KEY ("game") REFERENCES "public"."game"("abb");

ALTER TABLE ONLY "public"."moderator"
    ADD CONSTRAINT "moderator_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "public"."profile"("id");

ALTER TABLE ONLY "public"."notification"
    ADD CONSTRAINT "notification_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "public"."profile"("id");

ALTER TABLE ONLY "public"."notification"
    ADD CONSTRAINT "notification_level_fk" FOREIGN KEY ("game_id", "level_id", "category") REFERENCES "public"."level"("game", "name", "category") MATCH FULL;

ALTER TABLE ONLY "public"."notification"
    ADD CONSTRAINT "notification_monkey_id_fk" FOREIGN KEY ("monkey_id") REFERENCES "public"."monkey"("id");

ALTER TABLE ONLY "public"."notification"
    ADD CONSTRAINT "notification_platform_id_fkey" FOREIGN KEY ("platform_id") REFERENCES "public"."platform"("id");

ALTER TABLE ONLY "public"."notification"
    ADD CONSTRAINT "notification_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "public"."profile"("id");

ALTER TABLE ONLY "public"."notification"
    ADD CONSTRAINT "notification_region_id_fk" FOREIGN KEY ("region_id") REFERENCES "public"."region"("id");

ALTER TABLE ONLY "public"."notification"
    ADD CONSTRAINT "notification_submission_id_fkey" FOREIGN KEY ("submission_id") REFERENCES "public"."submission"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."post"
    ADD CONSTRAINT "post_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "public"."profile"("id");

ALTER TABLE ONLY "public"."profile"
    ADD CONSTRAINT "profile_country_fkey" FOREIGN KEY ("country") REFERENCES "public"."countries"("iso2");

ALTER TABLE ONLY "public"."profile"
    ADD CONSTRAINT "profile_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");

ALTER TABLE ONLY "public"."report"
    ADD CONSTRAINT "report_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "public"."profile"("id");

ALTER TABLE ONLY "public"."report"
    ADD CONSTRAINT "report_submission_fk" FOREIGN KEY ("submission_id") REFERENCES "public"."submission"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."submission"
    ADD CONSTRAINT "submission_level_fk" FOREIGN KEY ("game_id", "level_id", "category") REFERENCES "public"."level"("game", "name", "category") MATCH FULL;

ALTER TABLE ONLY "public"."submission"
    ADD CONSTRAINT "submission_monkey_id_fkey" FOREIGN KEY ("monkey_id") REFERENCES "public"."monkey"("id");

ALTER TABLE ONLY "public"."submission"
    ADD CONSTRAINT "submission_platform_id_fkey" FOREIGN KEY ("platform_id") REFERENCES "public"."platform"("id");

ALTER TABLE ONLY "public"."submission"
    ADD CONSTRAINT "submission_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "public"."profile"("id");

ALTER TABLE ONLY "public"."submission"
    ADD CONSTRAINT "submission_region_id_fkey" FOREIGN KEY ("region_id") REFERENCES "public"."region"("id");

CREATE POLICY "Enable authenticated users to delete rows they own" ON "public"."notification" FOR DELETE TO "authenticated" USING (("profile_id" = "public"."get_profile_id"()));

CREATE POLICY "Enable authenticated users to insert their own row" ON "public"."profile" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "user_id"));

CREATE POLICY "Enable authenticated users to select their own rows" ON "public"."notification" FOR SELECT TO "authenticated" USING (("profile_id" = "public"."get_profile_id"()));

CREATE POLICY "Enable delete for moderators who are unrelated to the report" ON "public"."report" FOR DELETE TO "authenticated" USING (("public"."is_moderator"() AND ("creator_id" <> "public"."get_profile_id"()) AND (( SELECT "submission"."profile_id"
   FROM "public"."submission"
  WHERE ("submission"."id" = "report"."submission_id")) <> "public"."get_profile_id"())));

CREATE POLICY "Enable insert for moderators" ON "public"."notification" FOR INSERT TO "authenticated" WITH CHECK ("public"."is_moderator"());

CREATE POLICY "Enable insert for moderators" ON "public"."post" FOR INSERT TO "authenticated" WITH CHECK (("public"."is_moderator"() AND ("profile_id" = ( SELECT "profile"."id"
   FROM "public"."profile"
  WHERE ("profile"."user_id" = "auth"."uid"()))) AND ("posted_at" = "now"())));

CREATE POLICY "Enable insert for moderators" ON "public"."submission" FOR INSERT TO "authenticated" WITH CHECK ("public"."is_moderator"());

CREATE POLICY "Enable mod delete for unapproved/irrelevant report submissions" ON "public"."submission" FOR DELETE TO "authenticated" USING (("public"."is_moderator"() AND (NOT (EXISTS ( SELECT 1
   FROM "public"."approve"
  WHERE ("approve"."submission_id" = "submission"."id")))) AND (NOT (EXISTS ( SELECT 1
   FROM "public"."report"
  WHERE (("report"."submission_id" = "submission"."id") AND ("report"."creator_id" = "public"."get_profile_id"()))))) AND (NOT ((EXISTS ( SELECT 1
   FROM "public"."report"
  WHERE ("report"."submission_id" = "submission"."id"))) AND ("profile_id" = "public"."get_profile_id"())))));

CREATE POLICY "Enable mod updates for unapproved submissions" ON "public"."submission" FOR UPDATE TO "authenticated" USING (("public"."is_moderator"() AND (NOT (EXISTS ( SELECT 1
   FROM "public"."approve"
  WHERE ("approve"."submission_id" = "submission"."id")))))) WITH CHECK (("public"."is_moderator"() AND (NOT (EXISTS ( SELECT 1
   FROM "public"."approve"
  WHERE ("approve"."submission_id" = "submission"."id"))))));

CREATE POLICY "Enable normal users to insert their own submissions" ON "public"."submission" FOR INSERT TO "authenticated" WITH CHECK (("profile_id" = "public"."get_profile_id"()));

CREATE POLICY "Enable read access for all users" ON "public"."approve" FOR SELECT USING (true);

CREATE POLICY "Enable read access for all users" ON "public"."countries" FOR SELECT USING (true);

CREATE POLICY "Enable read access for all users" ON "public"."game" FOR SELECT USING (true);

CREATE POLICY "Enable read access for all users" ON "public"."game_monkey" FOR SELECT USING (true);

CREATE POLICY "Enable read access for all users" ON "public"."game_platform" FOR SELECT USING (true);

CREATE POLICY "Enable read access for all users" ON "public"."game_region" FOR SELECT USING (true);

CREATE POLICY "Enable read access for all users" ON "public"."game_rule" FOR SELECT USING (true);

CREATE POLICY "Enable read access for all users" ON "public"."level" FOR SELECT USING (true);

CREATE POLICY "Enable read access for all users" ON "public"."mode" FOR SELECT USING (true);

CREATE POLICY "Enable read access for all users" ON "public"."moderator" FOR SELECT USING (true);

CREATE POLICY "Enable read access for all users" ON "public"."monkey" FOR SELECT USING (true);

CREATE POLICY "Enable read access for all users" ON "public"."platform" FOR SELECT USING (true);

CREATE POLICY "Enable read access for all users" ON "public"."post" FOR SELECT USING (true);

CREATE POLICY "Enable read access for all users" ON "public"."profile" FOR SELECT USING (true);

CREATE POLICY "Enable read access for all users" ON "public"."region" FOR SELECT USING (true);

CREATE POLICY "Enable read access for all users" ON "public"."report" FOR SELECT USING (true);

CREATE POLICY "Enable read access for all users" ON "public"."rule" FOR SELECT USING (true);

CREATE POLICY "Enable read access for all users" ON "public"."submission" FOR SELECT USING (true);

CREATE POLICY "Enable restricted approvals for moderators" ON "public"."approve" FOR INSERT TO "authenticated" WITH CHECK (("public"."is_moderator"() AND (NOT "public"."report_exists"("submission_id"))));

CREATE POLICY "Enable restricted insert access for users" ON "public"."notification" FOR INSERT TO "authenticated" WITH CHECK ((("notif_type" = 'report'::"public"."notif_t") AND ("submission_id" IS NOT NULL) AND ("message" IS NOT NULL) AND ("creator_id" = "public"."get_profile_id"()) AND (EXISTS ( SELECT 1
   FROM "public"."submission"
  WHERE ("submission"."id" = "notification"."submission_id")))));

CREATE POLICY "Enable restricted unapprovals" ON "public"."approve" FOR DELETE TO "authenticated" USING (("public"."report_exists"("submission_id") OR ("public"."get_profile_id"() = ( SELECT "submission"."profile_id"
   FROM "public"."submission"
  WHERE ("submission"."id" = "approve"."submission_id")))));

CREATE POLICY "Enable update for authenticated users based on user ID" ON "public"."profile" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "user_id")) WITH CHECK ((("auth"."uid"() = "user_id") AND "public"."regulate_report_token"("report_token")));

CREATE POLICY "Enable users to update rows they own" ON "public"."submission" FOR UPDATE TO "authenticated" USING (("profile_id" = "public"."get_profile_id"())) WITH CHECK (("profile_id" = "public"."get_profile_id"()));

CREATE POLICY "Enforce receiving profile exists [RESTRICTIVE]" ON "public"."notification" AS RESTRICTIVE FOR INSERT TO "authenticated" WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profile"
  WHERE (("profile"."id" = "notification"."profile_id") AND ("profile"."user_id" IS NOT NULL)))));

CREATE POLICY "Insert restrictions [RESTRICTIVE]" ON "public"."submission" AS RESTRICTIVE FOR INSERT TO "authenticated" WITH CHECK ((("id" = "now"()) AND
CASE "public"."get_chart_type"("game_id", "level_id")
    WHEN 'both'::"text" THEN true
    WHEN 'score'::"text" THEN "score"
    WHEN 'time'::"text" THEN (NOT "score")
    ELSE false
END AND "public"."valid_monkey_platform_region"("game_id", "monkey_id", "platform_id", "region_id")));

CREATE POLICY "Report insert restrictions for authenticated users" ON "public"."report" FOR INSERT TO "authenticated" WITH CHECK ((("creator_id" = "public"."get_profile_id"()) AND ("creator_id" <> ( SELECT "submission"."profile_id"
   FROM "public"."submission"
  WHERE ("submission"."id" = "report"."submission_id")))));

CREATE POLICY "Update restrictions [RESTRICTIVE]" ON "public"."submission" AS RESTRICTIVE FOR UPDATE TO "authenticated" USING (true) WITH CHECK ("public"."valid_monkey_platform_region"("game_id", "monkey_id", "platform_id", "region_id"));

ALTER TABLE "public"."approve" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."countries" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."game" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."game_monkey" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."game_platform" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."game_region" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."game_rule" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."level" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."mode" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."moderator" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."monkey" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."notification" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."platform" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."post" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."profile" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."region" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."report" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."rule" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."submission" ENABLE ROW LEVEL SECURITY;

REVOKE USAGE ON SCHEMA "public" FROM PUBLIC;
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

GRANT ALL ON FUNCTION "public"."approve_notify"() TO "anon";
GRANT ALL ON FUNCTION "public"."approve_notify"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."approve_notify"() TO "service_role";

GRANT ALL ON FUNCTION "public"."approve_submission"() TO "anon";
GRANT ALL ON FUNCTION "public"."approve_submission"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."approve_submission"() TO "service_role";

GRANT ALL ON FUNCTION "public"."decrement_report_token"() TO "anon";
GRANT ALL ON FUNCTION "public"."decrement_report_token"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."decrement_report_token"() TO "service_role";

GRANT ALL ON FUNCTION "public"."get_chart_type"("game_id" "text", "level_id" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."get_chart_type"("game_id" "text", "level_id" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_chart_type"("game_id" "text", "level_id" "text") TO "service_role";

GRANT ALL ON TABLE "public"."submission" TO "anon";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE ON TABLE "public"."submission" TO "authenticated";
GRANT ALL ON TABLE "public"."submission" TO "service_role";

GRANT UPDATE("tas") ON TABLE "public"."submission" TO "authenticated";

GRANT UPDATE("submitted_at") ON TABLE "public"."submission" TO "authenticated";

GRANT UPDATE("monkey_id") ON TABLE "public"."submission" TO "authenticated";

GRANT UPDATE("platform_id") ON TABLE "public"."submission" TO "authenticated";

GRANT UPDATE("region_id") ON TABLE "public"."submission" TO "authenticated";

GRANT UPDATE("proof") ON TABLE "public"."submission" TO "authenticated";

GRANT UPDATE("comment") ON TABLE "public"."submission" TO "authenticated";

GRANT UPDATE("live") ON TABLE "public"."submission" TO "authenticated";

GRANT ALL ON FUNCTION "public"."get_position"("newrecord" "public"."submission", "liveonly" boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."get_position"("newrecord" "public"."submission", "liveonly" boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_position"("newrecord" "public"."submission", "liveonly" boolean) TO "service_role";

GRANT ALL ON FUNCTION "public"."get_profile_id"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_profile_id"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_profile_id"() TO "service_role";

GRANT ALL ON FUNCTION "public"."get_profiles"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_profiles"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_profiles"() TO "service_role";

GRANT ALL ON FUNCTION "public"."get_unapproved"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_unapproved"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_unapproved"() TO "service_role";

GRANT ALL ON FUNCTION "public"."insert_notify"() TO "anon";
GRANT ALL ON FUNCTION "public"."insert_notify"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."insert_notify"() TO "service_role";

GRANT ALL ON FUNCTION "public"."insert_notify_and_unapprove"() TO "anon";
GRANT ALL ON FUNCTION "public"."insert_notify_and_unapprove"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."insert_notify_and_unapprove"() TO "service_role";

GRANT ALL ON FUNCTION "public"."is_moderator"() TO "anon";
GRANT ALL ON FUNCTION "public"."is_moderator"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_moderator"() TO "service_role";

GRANT ALL ON FUNCTION "public"."prepare_submission"() TO "anon";
GRANT ALL ON FUNCTION "public"."prepare_submission"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."prepare_submission"() TO "service_role";

GRANT ALL ON FUNCTION "public"."regulate_report_token"("report_token" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."regulate_report_token"("report_token" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."regulate_report_token"("report_token" integer) TO "service_role";

GRANT ALL ON FUNCTION "public"."report_exists"("s_id" timestamp with time zone) TO "anon";
GRANT ALL ON FUNCTION "public"."report_exists"("s_id" timestamp with time zone) TO "authenticated";
GRANT ALL ON FUNCTION "public"."report_exists"("s_id" timestamp with time zone) TO "service_role";

GRANT ALL ON FUNCTION "public"."update_notify_and_unapprove"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_notify_and_unapprove"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_notify_and_unapprove"() TO "service_role";

GRANT ALL ON FUNCTION "public"."valid_monkey_platform_region"("game_id" "text", "monkey_id" integer, "platform_id" integer, "region_id" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."valid_monkey_platform_region"("game_id" "text", "monkey_id" integer, "platform_id" integer, "region_id" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."valid_monkey_platform_region"("game_id" "text", "monkey_id" integer, "platform_id" integer, "region_id" integer) TO "service_role";

GRANT ALL ON TABLE "public"."approve" TO "anon";
GRANT ALL ON TABLE "public"."approve" TO "authenticated";
GRANT ALL ON TABLE "public"."approve" TO "service_role";

GRANT ALL ON TABLE "public"."countries" TO "anon";
GRANT ALL ON TABLE "public"."countries" TO "authenticated";
GRANT ALL ON TABLE "public"."countries" TO "service_role";

GRANT ALL ON TABLE "public"."game" TO "anon";
GRANT ALL ON TABLE "public"."game" TO "authenticated";
GRANT ALL ON TABLE "public"."game" TO "service_role";

GRANT ALL ON TABLE "public"."game_monkey" TO "anon";
GRANT ALL ON TABLE "public"."game_monkey" TO "authenticated";
GRANT ALL ON TABLE "public"."game_monkey" TO "service_role";

GRANT ALL ON TABLE "public"."game_platform" TO "anon";
GRANT ALL ON TABLE "public"."game_platform" TO "authenticated";
GRANT ALL ON TABLE "public"."game_platform" TO "service_role";

GRANT ALL ON TABLE "public"."game_region" TO "anon";
GRANT ALL ON TABLE "public"."game_region" TO "authenticated";
GRANT ALL ON TABLE "public"."game_region" TO "service_role";

GRANT ALL ON TABLE "public"."game_rule" TO "anon";
GRANT ALL ON TABLE "public"."game_rule" TO "authenticated";
GRANT ALL ON TABLE "public"."game_rule" TO "service_role";

GRANT ALL ON TABLE "public"."level" TO "anon";
GRANT ALL ON TABLE "public"."level" TO "authenticated";
GRANT ALL ON TABLE "public"."level" TO "service_role";

GRANT ALL ON TABLE "public"."mode" TO "anon";
GRANT ALL ON TABLE "public"."mode" TO "authenticated";
GRANT ALL ON TABLE "public"."mode" TO "service_role";

GRANT ALL ON TABLE "public"."moderator" TO "anon";
GRANT ALL ON TABLE "public"."moderator" TO "authenticated";
GRANT ALL ON TABLE "public"."moderator" TO "service_role";

GRANT ALL ON TABLE "public"."monkey" TO "anon";
GRANT ALL ON TABLE "public"."monkey" TO "authenticated";
GRANT ALL ON TABLE "public"."monkey" TO "service_role";

GRANT ALL ON SEQUENCE "public"."monkey_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."monkey_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."monkey_id_seq" TO "service_role";

GRANT ALL ON TABLE "public"."notification" TO "anon";
GRANT ALL ON TABLE "public"."notification" TO "authenticated";
GRANT ALL ON TABLE "public"."notification" TO "service_role";

GRANT ALL ON TABLE "public"."platform" TO "anon";
GRANT ALL ON TABLE "public"."platform" TO "authenticated";
GRANT ALL ON TABLE "public"."platform" TO "service_role";

GRANT ALL ON TABLE "public"."post" TO "anon";
GRANT ALL ON TABLE "public"."post" TO "authenticated";
GRANT ALL ON TABLE "public"."post" TO "service_role";

GRANT ALL ON SEQUENCE "public"."post_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."post_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."post_id_seq" TO "service_role";

GRANT ALL ON TABLE "public"."profile" TO "anon";
GRANT ALL ON TABLE "public"."profile" TO "authenticated";
GRANT ALL ON TABLE "public"."profile" TO "service_role";

GRANT ALL ON SEQUENCE "public"."profile_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."profile_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."profile_id_seq" TO "service_role";

GRANT ALL ON TABLE "public"."region" TO "anon";
GRANT ALL ON TABLE "public"."region" TO "authenticated";
GRANT ALL ON TABLE "public"."region" TO "service_role";

GRANT ALL ON TABLE "public"."report" TO "anon";
GRANT ALL ON TABLE "public"."report" TO "authenticated";
GRANT ALL ON TABLE "public"."report" TO "service_role";

GRANT ALL ON TABLE "public"."rule" TO "anon";
GRANT ALL ON TABLE "public"."rule" TO "authenticated";
GRANT ALL ON TABLE "public"."rule" TO "service_role";

GRANT ALL ON SEQUENCE "public"."rule_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."rule_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."rule_id_seq" TO "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";

RESET ALL;
