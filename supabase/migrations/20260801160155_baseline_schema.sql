


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


CREATE EXTENSION IF NOT EXISTS "pg_cron" WITH SCHEMA "pg_catalog";






CREATE EXTENSION IF NOT EXISTS "pg_net" WITH SCHEMA "extensions";








ALTER SCHEMA "public" OWNER TO "postgres";


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "citext" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "moddatetime" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_monitor" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






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
    'sec_msec',
    'min',
    'min_sec',
    'min_sec_csec',
    'min_sec_msec',
    'hour',
    'hour_min',
    'hour_min_sec',
    'hour_min_sec_csec',
    'hour_min_sec_msec'
);


ALTER TYPE "public"."timer_t" OWNER TO "postgres";


CREATE TYPE "public"."type_t" AS ENUM (
    'score',
    'time'
);


ALTER TYPE "public"."type_t" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."add_game"("game" "jsonb", "modes" "jsonb", "levels" "jsonb", "game_monkeys" "jsonb", "game_platforms" "jsonb", "game_profiles" "jsonb", "game_regions" "jsonb", "game_rules" "jsonb") RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  -- Insert game
  INSERT INTO game (abb, name, custom, release_date, creator, download, live_preference, min_date)
  SELECT abb, name, custom, release_date, creator, download, live_preference, min_date
  FROM jsonb_to_record(game) AS g(abb text, name text, custom boolean, release_date date, creator int, download text, live_preference boolean, min_date date);

  -- Insert modes
  INSERT INTO mode (game, name, category, id)
  SELECT m.game, name, category, id
  FROM jsonb_to_recordset(modes) AS m(game text, name text, category text, id int);

  -- Insert levels
  INSERT INTO level (game, name, category, id, mode, chart_type, time, timer_type, ascending)
  SELECT l.game, name, category, id, mode, chart_type, time, timer_type, ascending
  FROM jsonb_to_recordset(levels) AS l(game text, name text, category text, id int, mode text, chart_type chart_t, time float, timer_type timer_t, ascending chart_t);

  -- Insert game monkeys
  INSERT INTO game_monkey (game, monkey, id)
  SELECT gm.game, monkey, id
  FROM jsonb_to_recordset(game_monkeys) AS gm(game text, monkey int, id int);

  -- Insert game platforms
  INSERT INTO game_platform (game, platform, id)
  SELECT gpl.game, platform, id
  FROM jsonb_to_recordset(game_platforms) AS gpl(game text, platform int, id int);

  -- Insert game profiles
  INSERT INTO game_profile (game, profile)
  SELECT gpr.game, profile
  FROM jsonb_to_recordset(game_profiles) AS gpr(game text, profile int);

  -- Insert game regions
  INSERT INTO game_region (game, region, id)
  SELECT gre.game, region, id
  FROM jsonb_to_recordset(game_regions) AS gre(game text, region int, id int);

  -- Insert game rules
  INSERT INTO game_rule (abb, rule, id)
  SELECT gru.game, rule, id
  FROM jsonb_to_recordset(game_rules) AS gru(game text, rule int, id int);
END;
$$;


ALTER FUNCTION "public"."add_game"("game" "jsonb", "modes" "jsonb", "levels" "jsonb", "game_monkeys" "jsonb", "game_platforms" "jsonb", "game_profiles" "jsonb", "game_regions" "jsonb", "game_rules" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."add_versions"("versions" "jsonb") RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  game_abb text;
  latest_version int;
  version_ids int[];
  i int;
  version_charts jsonb;
  version_id int;
  count int;
BEGIN
  -- Validate `versions` array is non-empty
  IF jsonb_array_length(versions) = 0 THEN
    RAISE EXCEPTION 'Must add at least one version.';
  END IF;

  -- Determine game from `versions` parameter
  game_abb := (versions->0->>'game')::text;

  -- If we have at least one chart, fetch the id of the most recent version belonging to `game_abb`
  SELECT id
  INTO latest_version
  FROM version
  WHERE game = game_abb
  ORDER BY sequence DESC
  LIMIT 1;

  -- Insert into `versions` table, and capture the IDs
  WITH inserted_versions AS (
    INSERT INTO version (game, sequence, version)
    SELECT game, sequence, version
    FROM jsonb_to_recordset(versions) AS v(game text, sequence int, version text)
    RETURNING id, sequence
  )
  SELECT array_agg(id ORDER BY sequence)
  INTO version_ids
  FROM inserted_versions;

  -- Loop over versions, and update chart submissions, if any
  FOR i IN 1..jsonb_array_length(versions) LOOP
    version_charts := (versions->(i-1))->'charts';
    version_id := version_ids[i];

    IF version_charts IS NOT NULL THEN
      UPDATE submission s
      SET version = version_id
      WHERE 
        (s.version = latest_version OR (latest_version IS NULL)) AND
        (s.category, s.game_id, s.level_id) IN (
          SELECT category, game_id, level_id
          FROM jsonb_to_recordset(version_charts)
          AS charts(category text, game_id text, level_id text)
        );
    END IF;
  END LOOP;
END;
$$;


ALTER FUNCTION "public"."add_versions"("versions" "jsonb") OWNER TO "postgres";


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


CREATE PROCEDURE "public"."check_submission_version"(IN "game_id" "text", IN "version_id" integer)
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  -- If game has at least one "version", validate it. Otherwise, ensure the version is NULL.
  IF EXISTS (SELECT 1 FROM version WHERE game = game_id) THEN
    IF version_id IS NULL OR NOT EXISTS (SELECT 1 FROM version WHERE id = version_id AND game = game_id) THEN
      RAISE EXCEPTION 'Invalid version for this game.';
    END IF;
  ELSE
    IF version_id IS NOT NULL THEN
      RAISE EXCEPTION 'Version must be null for games without versions.';
    END IF;
  END IF;
END;
$$;


ALTER PROCEDURE "public"."check_submission_version"(IN "game_id" "text", IN "version_id" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."decrement_report_token"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  reported_submission submission%ROWTYPE;
BEGIN
  -- First, fetch reported submission data using the `submission_id` field
  SELECT *
  FROM submission
  INTO reported_submission
  WHERE id = NEW.submission_id;

  -- This function will only do something if
  -- 1.) User is normal (not moderator / administrator)
  -- 2.) Creator of report differs from owner of submission
  IF (NOT (is_moderator(reported_submission.game_id)) AND NEW.creator_id <> reported_submission.profile_id) THEN
    -- Check if the profile has greater than 0 report tokens
    IF (SELECT report_token FROM profile WHERE user_id = auth.uid()) <= 0 THEN
      RAISE EXCEPTION 'You have ran out of reports for the day. Try again tomorrow.';
    END IF;

    -- Decrement the report_token
    UPDATE profile
    SET report_token = report_token - 1
    WHERE user_id = auth.uid();
  END IF;

  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."decrement_report_token"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_category_levels_by_mode"("game_name" "text", "category_name" "text", "is_score" boolean) RETURNS TABLE("name" "text")
    LANGUAGE "sql"
    AS $$
  SELECT COALESCE(json_agg(row_to_json(record_row)), '[]'::json)
  FROM (
    SELECT
      name,
      (
        SELECT json_agg(row_to_json(levels_row))
        FROM (
            SELECT
                l.name,
                l.timer_type
            FROM level l
            WHERE (m.game = l.game AND m.category = l.category AND m.name = l.mode) AND ((is_score = true AND l.chart_type IN ('score', 'both')) OR (is_score = false AND l.chart_type IN ('time', 'both')))
            ORDER BY l.id
        ) levels_row
      ) AS levels
    FROM mode m
    WHERE (EXISTS (
      SELECT 1
      FROM level l
      WHERE (m.game = l.game AND m.category = l.category AND m.name = l.mode) AND ((is_score = true AND l.chart_type IN ('score', 'both')) OR (is_score = false AND l.chart_type IN ('time', 'both')))
    )) AND m.game = game_name AND m.category = category_name
    ORDER BY m.id
  ) record_row
$$;


ALTER FUNCTION "public"."get_category_levels_by_mode"("game_name" "text", "category_name" "text", "is_score" boolean) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_category_time"("game_name" "text", "category_name" "text") RETURNS real
    LANGUAGE "sql"
    AS $$
  SELECT COALESCE(SUM(time), 0::float4)
  FROM level
  WHERE game = game_name AND category = category_name AND chart_type <> 'score'::chart_t;
$$;


ALTER FUNCTION "public"."get_category_time"("game_name" "text", "category_name" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_chart_submissions"("game" "text", "category_name" "text", "level" "text", "is_score" boolean, "version_key" integer) RETURNS json
    LANGUAGE "sql"
    AS $$
  WITH chart_submissions AS (
    SELECT *
    FROM submission s
    WHERE s.game_id = game AND s.category = category_name AND s.level_id = level AND s.score = is_score AND (CASE WHEN version IS NOT NULL THEN version = version_key ELSE true END)
  ),
  ranked_by_profile AS (
    SELECT cs.id, cs.record, cs.live, ROW_NUMBER() OVER (PARTITION BY cs.profile_id ORDER BY cs.submitted_at DESC, cs.id DESC) AS rn
    FROM chart_submissions cs
    WHERE cs.tas = false
  ),
  ranked AS (
    SELECT rbp.id
    FROM ranked_by_profile rbp
    WHERE rbp.rn = 1
  ),
  live_ranked AS (
    SELECT rbp.id, RANK() OVER (ORDER BY rbp.record DESC) AS "position"
    FROM ranked_by_profile rbp
    WHERE rbp.rn = 1 AND rbp.live = true
  ),
  ranked_by_profile_tas AS (
    SELECT cs.id, cs.record, cs.live, ROW_NUMBER() OVER (PARTITION BY cs.profile_id ORDER BY cs.submitted_at DESC) AS rn
    FROM chart_submissions cs
    WHERE cs.tas = true
  ),
  tas_ranked AS (
    SELECT rbpt.id
    FROM ranked_by_profile_tas rbpt
    WHERE rbpt.rn = 1
  )
  SELECT COALESCE((json_agg(row_to_json(chart_row))), '[]'::json)
  FROM (
    SELECT
      (SELECT jsonb_build_object('creator', jsonb_build_object('country', p.country, 'id', p.id, 'username', p.username)) FROM approve a INNER JOIN profile p ON a.creator_id = p.id WHERE a.submission_id = cs.id) AS "approve",
      cs.comment,
      cs.id,
      cs.live,
      CASE
        WHEN live_ranked.position = 3 THEN 'bronze'
        WHEN live_ranked.position = 2 THEN 'silver'
        WHEN live_ranked.position = 1 AND EXISTS (SELECT 1 FROM live_ranked lr WHERE lr.position = 1 AND lr.id <> live_ranked.id) THEN 'gold'
        WHEN live_ranked.position = 1 THEN 'platinum'
        ELSE NULL
      END as medal,
      cs.mod_note,
      (SELECT row_to_json(monkey_row) FROM (SELECT m.id, m.monkey_name FROM monkey m WHERE cs.monkey_id = m.id) AS monkey_row) monkey,
      CASE WHEN (ranked.id IS NULL AND tas_ranked.id IS NULL) THEN true ELSE false END AS obsolete,
      (SELECT row_to_json(platform_row) FROM (SELECT pl.id, pl.platform_abb, pl.platform_name FROM platform pl WHERE cs.platform_id = pl.id) AS platform_row) platform,
      (SELECT row_to_json(profile_row) FROM (SELECT pr.id, pr.username, pr.country FROM profile pr WHERE cs.profile_id = pr.id) AS profile_row) profile,
      cs.proof,
      cs.record,
      (SELECT row_to_json(region_row) FROM (SELECT rg.id, rg.region_name FROM region rg WHERE cs.region_id = rg.id) AS region_row) region,
      (SELECT row_to_json(report_row) FROM (SELECT rp.creator_id FROM report rp WHERE rp.submission_id = cs.id) AS report_row) report,
      cs.submitted_at,
      cs.tas,
      cs.version
    FROM chart_submissions cs
    LEFT OUTER JOIN ranked ON cs.id = ranked.id
    LEFT OUTER JOIN live_ranked ON cs.id = live_ranked.id
    LEFT OUTER JOIN tas_ranked ON cs.id = tas_ranked.id
    ORDER BY cs.record DESC, cs.submitted_at ASC
  ) chart_row
$$;


ALTER FUNCTION "public"."get_chart_submissions"("game" "text", "category_name" "text", "level" "text", "is_score" boolean, "version_key" integer) OWNER TO "postgres";


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


CREATE OR REPLACE FUNCTION "public"."get_chart_types"() RETURNS json
    LANGUAGE "sql"
    AS $$
  SELECT array_to_json(ARRAY(
    SELECT unnest(enum_range(NULL::chart_t))::text AS chart_type
    ORDER BY chart_type
  ));
$$;


ALTER FUNCTION "public"."get_chart_types"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_medals"("abb" "text", "category" "text", "score" boolean, "version" integer) RETURNS json
    LANGUAGE "sql"
    AS $$
WITH ranked_submissions AS (
  SELECT
    level_id,
    id,
    username,
    country,
    "position"
  FROM get_ranked_submissions(abb, category, score, true, version)
),
medal_counts AS (
  SELECT
    id,
    username,
    country,
    COUNT(*) FILTER (WHERE "position" = 1 AND (SELECT COUNT(*) FROM ranked_submissions rs WHERE rs.level_id = ranked_submissions.level_id AND rs."position" = 1) = 1) AS platinum,
    COUNT(*) FILTER (WHERE "position" = 1 AND (SELECT COUNT(*) FROM ranked_submissions rs WHERE rs.level_id = ranked_submissions.level_id AND rs."position" = 1) > 1) AS gold,
    COUNT(*) FILTER (WHERE "position" = 2) AS silver,
    COUNT(*) FILTER (WHERE "position" = 3) AS bronze
  FROM ranked_submissions
  GROUP BY id, username, country
)
SELECT CASE WHEN category IN (SELECT abb FROM category WHERE practice = true) THEN COALESCE((json_agg(row_to_json(medals_row))), '[]'::json) ELSE '[]'::json END
FROM (
  SELECT
    (SELECT jsonb_build_object('country', mc.country, 'id', mc.id, 'username', mc.username)) AS profile,
    platinum,
    gold,
    silver,
    bronze,
    RANK() OVER (ORDER BY platinum DESC, gold DESC, silver DESC, bronze DESC) AS "position"
  FROM medal_counts mc
  ORDER BY platinum DESC, gold DESC, silver DESC, bronze DESC
) medals_row
$$;


ALTER FUNCTION "public"."get_medals"("abb" "text", "category" "text", "score" boolean, "version" integer) OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."submission" (
    "id" timestamp with time zone DEFAULT "now"() NOT NULL,
    "game_id" "text" NOT NULL,
    "level_id" "text" NOT NULL,
    "category" "text" NOT NULL,
    "profile_id" integer NOT NULL,
    "score" boolean NOT NULL,
    "tas" boolean NOT NULL,
    "record" double precision NOT NULL,
    "submitted_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "monkey_id" integer NOT NULL,
    "platform_id" integer NOT NULL,
    "region_id" integer NOT NULL,
    "proof" character varying(256) NOT NULL,
    "comment" character varying(100) NOT NULL,
    "live" boolean NOT NULL,
    "position" integer,
    "all_position" integer NOT NULL,
    "mod_note" character varying(100) DEFAULT ''::character varying NOT NULL,
    "version" integer,
    CONSTRAINT "submission_proof_live_constraint" CHECK ((((("proof")::"text" = ''::"text") AND ("live" = false)) OR ((("proof")::"text" <> ''::"text") AND ("live" = ANY (ARRAY[true, false]))))),
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
        AND (newRecord.version IS NULL OR version = newRecord.version)
      GROUP BY profile_id
    ) latest_submissions ON s2.profile_id = latest_submissions.profile_id AND s2.submitted_at = latest_submissions.max_submitted_at
    WHERE game_id = newRecord.game_id
      AND level_id = newRecord.level_id
      AND category = newRecord.category
      AND score = newRecord.score
      AND s2.profile_id <> (get_profile_id())
      AND tas = newRecord.tas
      AND (NOT liveOnly OR live = TRUE)
      AND (newRecord.version IS NULL OR version = newRecord.version)
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


CREATE OR REPLACE FUNCTION "public"."get_profile"("p_id" integer) RETURNS json
    LANGUAGE "sql"
    AS $$
  SELECT row_to_json(profiles_row)
  FROM (
    SELECT
      EXISTS (SELECT 1 FROM administrator a WHERE a.profile_id = p_id) AS administrator,
      bio,
      birthday,
      (SELECT row_to_json(country_row) FROM (SELECT c.iso2, c.name FROM countries c WHERE c.iso2 = p.country) AS country_row) country,
      discord,
      featured_video,
      id,
      (
        SELECT COALESCE ((json_agg(jsonb_build_object(
          'abb', g.abb,
          'custom', g.custom,
          'name', g.name
        ) ORDER BY g.release_date)), '[]'::json)
        FROM (
          SELECT g.abb, g.custom, g.release_date, g.name
          FROM game_profile gp
          INNER JOIN game AS g ON g.abb = gp.game
          WHERE gp.profile = p_id
          ORDER BY g.release_date
        ) g
      ) moderated_games,
      (
        SELECT COALESCE (json_agg(jsonb_build_object(
          'abb', g.abb,
          'categories', (
            SELECT json_agg(jsonb_build_object(
              'abb', c.category,
              'types', (
                SELECT json_agg(DISTINCT l.chart_type)
                FROM level l
                WHERE l.game = g.abb AND l.category = c.category
              )
            ))
            FROM (
              SELECT * FROM (
                SELECT DISTINCT ON (m.category) m.category, m.id
                FROM mode m
                WHERE m.game = g.abb
                ORDER BY m.category, m.id
              ) dc ORDER BY dc.id
            ) c
          ),
          'custom', g.custom,
          'live_preference', g.live_preference,
          'name', g.name,
          'versions', (
            SELECT json_agg(jsonb_build_object(
              'id', v.id,
              'version', v.version,
              'sequence', v.sequence 
            ))
            FROM version v
            WHERE v.game = g.abb
          )
        ) ORDER BY g.release_date), '[]'::json) AS submitted_games
        FROM (
          SELECT DISTINCT ON (s.game_id) s.game_id AS abb, g.custom, g.release_date, g.live_preference, g.name
          FROM submission s
          INNER JOIN game AS g ON g.abb = s.game_id
          WHERE s.profile_id = p_id
        ) g
      ) submitted_games,
      twitch_username,
      twitter_handle,
      username,
      video_description,
      youtube_handle
    FROM profile p
    WHERE p.id = p_id
  ) profiles_row
$$;


ALTER FUNCTION "public"."get_profile"("p_id" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_profile_id"() RETURNS integer
    LANGUAGE "sql"
    AS $$SELECT id
FROM profile
WHERE user_id = auth.uid();$$;


ALTER FUNCTION "public"."get_profile_id"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_profiles"() RETURNS json
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


CREATE OR REPLACE FUNCTION "public"."get_ranked_submissions"("game_name" "text", "category_name" "text", "is_score" boolean, "live_only" boolean, "version_key" integer) RETURNS TABLE("game_id" "text", "level_id" "text", "category" "text", "id" integer, "username" character varying, "country" "text", "record" double precision, "submitted_at" timestamp with time zone, "live" boolean, "position" integer)
    LANGUAGE "sql"
    AS $$
  WITH ranked AS (
    SELECT 
      s.game_id, 
      s.level_id, 
      s.category, 
      p.id, 
      p.username, 
      p.country, 
      s.record, 
      s.score, 
      s.submitted_at, 
      s.live, 
      l.id AS level_ctr, 
      ROW_NUMBER() OVER (PARTITION BY (
        s.profile_id, 
        s.game_id, 
        s.category, 
        s.level_id, 
        s.score, 
        CASE WHEN live_only THEN s.live ELSE NULL END,
        CASE WHEN version_key IS NOT NULL THEN s.version ELSE NULL END
      ) ORDER BY s.submitted_at DESC, s.id DESC) AS rn
    FROM submission s
    INNER JOIN profile p ON s.profile_id = p.id
    INNER JOIN level l ON (
      s.game_id = l.game AND 
      s.level_id = l.name AND 
      s.category = l.category
    )  
    WHERE 
      s.game_id = game_name AND 
      s.category = category_name AND 
      s.score = is_score AND 
      tas = false AND 
      (NOT live_only OR s.live = true) AND
      (version_key IS NULL OR s.version = version_key)
  )
  SELECT 
    r.game_id, 
    r.level_id, 
    r.category, 
    r.id, 
    r.username, 
    r.country, 
    r.record, 
    r.submitted_at, 
    r.live, 
    RANK() OVER (PARTITION BY r.level_id ORDER BY r.record DESC) AS "position"
  FROM ranked r
  WHERE r.rn = 1
  ORDER BY r.level_ctr ASC, r.record DESC, r.submitted_at ASC
$$;


ALTER FUNCTION "public"."get_ranked_submissions"("game_name" "text", "category_name" "text", "is_score" boolean, "live_only" boolean, "version_key" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_ranked_submissions_json"("game_name" "text", "category_name" "text", "is_score" boolean, "live_only" boolean, "version_key" integer) RETURNS json
    LANGUAGE "sql"
    SET "extra_float_digits" TO '1'
    AS $$
  SELECT COALESCE(json_agg(row_to_json(s)), '[]'::json)
  FROM get_ranked_submissions(game_name, category_name, is_score, live_only, version_key) s
$$;


ALTER FUNCTION "public"."get_ranked_submissions_json"("game_name" "text", "category_name" "text", "is_score" boolean, "live_only" boolean, "version_key" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_record_submissions"("game_name" "text", "category_name" "text", "is_score" boolean, "live_only" boolean, "version_key" integer DEFAULT NULL::integer) RETURNS TABLE("id" timestamp with time zone, "game_id" "text", "level_id" "text", "category" "text", "profile_id" integer, "username" character varying, "country" "text", "record" double precision, "submitted_at" timestamp with time zone, "live" boolean)
    LANGUAGE "sql"
    AS $$
  WITH ranked AS (
    SELECT 
      s.id,
      s.game_id, 
      s.level_id, 
      s.category, 
      p.id AS profile_id, 
      p.username, 
      p.country, 
      s.record, 
      s.score, 
      s.submitted_at, 
      s.live, 
      l.id AS level_ctr, 
      RANK() OVER (
        PARTITION BY (
          s.game_id, 
          s.category, 
          s.level_id, 
          s.score, 
          CASE WHEN live_only THEN s.live ELSE NULL END,
          CASE WHEN version_key IS NOT NULL THEN s.version ELSE NULL END
        ) 
        ORDER BY s.record DESC
      ) AS rn
    FROM submission s
    INNER JOIN profile p ON s.profile_id = p.id
    INNER JOIN level l ON (s.game_id = l.game AND s.level_id = l.name AND s.category = l.category)  
    WHERE 
      s.game_id = game_name
      AND s.category = category_name
      AND s.score = is_score
      AND tas = false
      AND (NOT live_only OR s.live = true)
      AND (version_key IS NULL OR s.version = version_key)
  )
  SELECT r.id, r.game_id, r.level_id, r.category, r.profile_id, r.username, r.country, r.record, r.submitted_at, r.live
  FROM ranked r
  WHERE r.rn = 1
  ORDER BY r.level_ctr ASC, r.record DESC, r.submitted_at ASC
$$;


ALTER FUNCTION "public"."get_record_submissions"("game_name" "text", "category_name" "text", "is_score" boolean, "live_only" boolean, "version_key" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_record_submissions_json"("game_name" "text", "category_name" "text", "is_score" boolean, "live_only" boolean, "version_key" integer) RETURNS json
    LANGUAGE "sql"
    SET "extra_float_digits" TO '1'
    AS $$
  SELECT COALESCE(json_agg(row_to_json(s)), '[]'::json)
  FROM get_record_submissions(game_name, category_name, is_score, live_only, version_key) s
$$;


ALTER FUNCTION "public"."get_record_submissions_json"("game_name" "text", "category_name" "text", "is_score" boolean, "live_only" boolean, "version_key" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_reported"("abb" "text") RETURNS json
    LANGUAGE "sql"
    AS $$
  SELECT COALESCE((json_agg(row_to_json(submissions_row))), '[]'::json)
  FROM (
    SELECT
      s.all_position,
      s.comment,
      s.id,
      (SELECT jsonb_build_object('category', l.category, 'name', l.name, 'timer_type', l.timer_type, 'mode', jsonb_build_object('game', jsonb_build_object('abb', g.abb, 'name', g.name))) FROM level l INNER JOIN mode m ON l.game = m.game AND l.mode = m.name AND l.category = m.category INNER JOIN game g ON m.game = g.abb WHERE l.game = s.game_id AND l.name = s.level_id AND l.category = s.category) AS "level",
      s.live,
      s.mod_note,
      (SELECT row_to_json(monkey_row) FROM (SELECT m.id, m.monkey_name FROM monkey m WHERE m.id = s.monkey_id) AS monkey_row) monkey,
      (SELECT row_to_json(platform_row) FROM (SELECT pl.id, pl.platform_name FROM platform pl WHERE pl.id = s.platform_id) AS platform_row) platform,
      s.position,
      (SELECT row_to_json(profile_row) FROM (SELECT pr.country, pr.id, pr.username FROM profile pr WHERE pr.id = s.profile_id) AS profile_row) profile,
      (SELECT row_to_json(region_row) FROM (SELECT rg.id, rg.region_name FROM region rg WHERE rg.id = s.region_id) AS region_row) region,
      (SELECT jsonb_build_object('creator', jsonb_build_object('country', p.country, 'id', p.id, 'username', p.username), 'message', r.message, 'report_date', r.report_date)) AS "report",
      s.proof,
      s.record,
      s.score,
      s.submitted_at,
      s.tas,
      (SELECT row_to_json(version_row) FROM (SELECT v.id, v.version, v.sequence FROM version v WHERE v.id = s.version) AS version_row) version
    FROM submission s
    INNER JOIN report r ON r.submission_id = s.id
    INNER JOIN profile p ON p.id = r.creator_id
    WHERE s.game_id = abb
    ORDER BY r.report_date
  ) submissions_row
$$;


ALTER FUNCTION "public"."get_reported"("abb" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_timer_types"() RETURNS json
    LANGUAGE "sql"
    AS $$
  SELECT json_agg(timer_type)::json
  FROM unnest(enum_range(NULL::timer_t)) AS timer_type;
$$;


ALTER FUNCTION "public"."get_timer_types"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_unapproved"() RETURNS json
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


CREATE OR REPLACE FUNCTION "public"."get_unapproved"("abb" "text") RETURNS json
    LANGUAGE "sql"
    AS $$
  SELECT COALESCE((json_agg(row_to_json(submissions_row))), '[]'::json)
  FROM (
    SELECT
      s.all_position,
      s.comment,
      s.id,
      (SELECT jsonb_build_object('category', l.category, 'name', l.name, 'timer_type', l.timer_type, 'mode', jsonb_build_object('game', jsonb_build_object('abb', g.abb, 'name', g.name))) FROM level l INNER JOIN mode m ON l.game = m.game AND l.mode = m.name AND l.category = m.category INNER JOIN game g ON m.game = g.abb WHERE l.game = s.game_id AND l.name = s.level_id AND l.category = s.category) AS "level",
      s.live,
      s.mod_note,
      (SELECT row_to_json(monkey_row) FROM (SELECT m.id, m.monkey_name FROM monkey m WHERE m.id = s.monkey_id) AS monkey_row) monkey,
      (SELECT row_to_json(platform_row) FROM (SELECT pl.id, pl.platform_name FROM platform pl WHERE pl.id = s.platform_id) AS platform_row) platform,
      s.position,
      (SELECT row_to_json(profile_row) FROM (SELECT pr.country, pr.id, pr.username FROM profile pr WHERE pr.id = s.profile_id) AS profile_row) profile,
      (SELECT row_to_json(region_row) FROM (SELECT rg.id, rg.region_name FROM region rg WHERE rg.id = s.region_id) AS region_row) region,
      s.proof,
      s.record,
      s.score,
      s.submitted_at,
      s.tas,
      (SELECT row_to_json(version_row) FROM (SELECT v.id, v.version, v.sequence FROM version v WHERE v.id = s.version) AS version_row) version
    FROM submission s
    LEFT OUTER JOIN approve a ON a.submission_id = s.id
    LEFT OUTER JOIN report r ON r.submission_id = s.id
    WHERE
      (a.approve_date IS NULL) AND
      (r.report_date IS NULL) AND
      (s.game_id = abb)
    ORDER BY s.id
  ) submissions_row
$$;


ALTER FUNCTION "public"."get_unapproved"("abb" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_unapproved_counts"("abbs" "text"[]) RETURNS json
    LANGUAGE "sql"
    AS $$
  SELECT json_agg(row_to_json(submission_row))
  FROM (
    SELECT 
      g.abb AS abb,
      g.min_date,
      (
        SELECT json_agg(monkey_row)
        FROM (
          SELECT m.id, m.monkey_name
          FROM game_monkey gm
          INNER JOIN monkey m ON gm.monkey = m.id
          WHERE gm.game = g.abb
          ORDER BY gm.id
        ) monkey_row
      ) AS monkey,
      g.name,
       (
        SELECT json_agg(platform_row)
        FROM (
          SELECT p.id, p.platform_name
          FROM game_platform gp
          INNER JOIN platform p ON gp.platform = p.id
          WHERE gp.game = g.abb
          ORDER BY gp.id
        ) platform_row
      ) AS platform,
      (
        SELECT json_agg(region_row)
        FROM (
          SELECT r.id, r.region_name
          FROM game_region gr
          INNER JOIN region r ON gr.region = r.id
          WHERE gr.game = g.abb
          ORDER BY gr.id
        ) region_row
      ) AS region,
      g.release_date,
      COUNT(CASE WHEN s.id IS NOT NULL AND a.submission_id IS NULL AND r.submission_id IS NOT NULL THEN 1 ELSE NULL END) AS reported,
      COUNT(CASE WHEN s.id IS NOT NULL AND a.submission_id IS NULL AND r.submission_id IS NULL THEN 1 ELSE NULL END) AS unapproved,
      (
        SELECT COALESCE(json_agg(version_row), '[]'::json)
        FROM (
          SELECT v.id, v.version, v.sequence
          FROM version v
          WHERE v.game = g.abb
          ORDER BY v.sequence
        ) version_row
      ) AS version
    FROM game g
    LEFT JOIN submission s ON g.abb = s.game_id
    LEFT JOIN approve a ON s.id = a.submission_id
    LEFT JOIN report r ON s.id = r.submission_id
    WHERE
      CASE
        WHEN array_length(abbs, 1) > 0 THEN g.abb = ANY(abbs)
        ELSE true
      END
    GROUP BY g.abb
    ORDER BY g.release_date
  ) submission_row
$$;


ALTER FUNCTION "public"."get_unapproved_counts"("abbs" "text"[]) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."has_mod_note_changed"("submission_id" timestamp with time zone, "new_note" character varying) RETURNS boolean
    LANGUAGE "sql"
    AS $$
  SELECT (
    SELECT mod_note
    FROM submission s
    WHERE s.id = submission_id
  ) IS DISTINCT FROM new_note;
$$;


ALTER FUNCTION "public"."has_mod_note_changed"("submission_id" timestamp with time zone, "new_note" character varying) OWNER TO "postgres";


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
    reported_submission submission%ROWTYPE;
    current_id int4;
    user_id_for_notif uuid;
  BEGIN
    -- first, we need to get the submission data based on NEW.submission_id
    SELECT *
    FROM submission
    INTO reported_submission
    WHERE id = NEW.submission_id;

    -- next, let's verify that the submission's profile is authenticated
    SELECT user_id into user_id_for_notif
    FROM profile
    WHERE id = reported_submission.profile_id;

    -- if the submission being updated belongs to an authenticated user, we need to send a REPORT notification
    IF user_id_for_notif IS NOT NULL then
      -- now, get the profile id of the user who created report; we should only notify if current_id <> reported_submission.profile_id
      current_id := get_profile_id();
      IF current_id <> reported_submission.profile_id THEN
        INSERT INTO notification (submission_id, game_id, level_id, category, score, tas, record, profile_id, creator_id, notif_type, message, report_id)
        VALUES (NEW.submission_id, reported_submission.game_id, reported_submission.level_id, reported_submission.category, reported_submission.score, reported_submission.tas, reported_submission.record, reported_submission.profile_id, current_id, 'report', NEW.message, NEW.report_date);
      END IF;
    END IF;
    
    -- finally, let's unapprove the submission, if it was approved
    DELETE from approve
    WHERE submission_id = NEW.submission_id;

    RETURN NEW;
  END;
$$;


ALTER FUNCTION "public"."insert_notify_and_unapprove"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_admin"() RETURNS boolean
    LANGUAGE "sql"
    AS $$
    SELECT EXISTS (
        SELECT 1
        FROM administrator
        WHERE profile_id = get_profile_id()
    )
$$;


ALTER FUNCTION "public"."is_admin"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_already_notified"("id" timestamp with time zone) RETURNS boolean
    LANGUAGE "sql"
    AS $$
  SELECT (
    EXISTS (
      SELECT 1
      FROM notification
      WHERE report_id = id
    )
  )
$$;


ALTER FUNCTION "public"."is_already_notified"("id" timestamp with time zone) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_moderator"("abb" "text") RETURNS boolean
    LANGUAGE "sql"
    AS $$
    SELECT (
        is_admin() OR EXISTS (
            SELECT 1
            FROM game_profile
            WHERE profile = get_profile_id() AND game = abb
        )
    )
$$;


ALTER FUNCTION "public"."is_moderator"("abb" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_only_version_changed"("submission_id" timestamp with time zone, "new_tas" boolean, "new_submitted_at" timestamp with time zone, "new_monkey_id" integer, "new_platform_id" integer, "new_region_id" integer, "new_proof" "text", "new_comment" "text", "new_live" boolean, "new_mod_note" "text", "new_version" integer) RETURNS boolean
    LANGUAGE "sql"
    AS $$
  SELECT (
    s.tas = new_tas AND
    s.submitted_at = new_submitted_at AND
    s.monkey_id = new_monkey_id AND
    s.platform_id = new_platform_id AND
    s.region_id = new_region_id AND
    s.proof = new_proof AND
    s.comment = new_comment AND
    s.live = new_live AND
    s.mod_note = new_mod_note AND
    COALESCE(s.version, -1) <> COALESCE(new_version, -1)
  )
  FROM submission s
  WHERE s.id = submission_id
$$;


ALTER FUNCTION "public"."is_only_version_changed"("submission_id" timestamp with time zone, "new_tas" boolean, "new_submitted_at" timestamp with time zone, "new_monkey_id" integer, "new_platform_id" integer, "new_region_id" integer, "new_proof" "text", "new_comment" "text", "new_live" boolean, "new_mod_note" "text", "new_version" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_url_safe"("input" "text") RETURNS boolean
    LANGUAGE "sql"
    AS $_$
  SELECT input ~ '^[a-zA-Z0-9\-_.!~*''()%]+$';
$_$;


ALTER FUNCTION "public"."is_url_safe"("input" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."prepare_submission_insert"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
  DECLARE
    negative_transform public.chart_t;
    level_timer_type public.timer_t;
  BEGIN
    -- First, let's just validate that version is valid
    CALL check_submission_version(NEW.game_id, NEW.version);

    -- Next, let's quickly validate that user is trying to insert a positive record. The value may be transformed to a negative
    -- value by this function, but should NEVER begin as negative
    IF NEW.record < 0 THEN
      RAISE EXCEPTION 'Record cannot be a negative value.';
    END IF;

    -- ascending -> `negative_transform`, timer_type -> `level_timer_type`
    SELECT ascending, timer_type
    INTO negative_transform, level_timer_type
    FROM level l
    WHERE l.game = NEW.game_id AND l.name = NEW.level_id AND l.category = NEW.category;

    -- If the submission is for a time chart, let's perform any necessary record modifications based on both the 
    -- `time_negative_transform` and `level_timer_time`
    IF NOT new.score THEN

      -- Apply any transformations based on the `level_timer_type` variable
      IF NOT (level_timer_type IN ('sec_csec', 'sec_msec', 'min_sec_csec', 'min_sec_msec', 'hour_min_sec_csec', 'hour_min_sec_msec')) THEN
        NEW.record := FLOOR(NEW.record); -- Round down to the nearest second
      END IF;
      IF level_timer_type IN ('min', 'hour', 'hour_min') THEN
        NEW.record := (FLOOR(NEW.record / 60)) * 60::float8; -- Round down to nearest minute
      END IF;
      IF level_timer_type = 'hour' THEN
        NEW.record := (FLOOR(NEW.record / 3600)) * 3600::float8; -- Round down to nearest hour
      END IF;

      -- Apply any transformations based on the `negative_transform` variable
      IF negative_transform IN ('time'::chart_t, 'both'::chart_t) THEN
        NEW.record := NEW.record * (-1); -- negate the record attribute
      END IF;

    -- Otherwise, let's perform any necessary record modifications based on the `negative_transform` variable
    ELSE
      IF negative_transform IN ('score'::chart_t, 'both'::chart_t) THEN
        NEW.record := NEW.record * (-1); -- negate the record attribute
      END IF;
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
  END;
$$;


ALTER FUNCTION "public"."prepare_submission_insert"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."prepare_submission_update"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
  BEGIN
    CALL check_submission_version(NEW.game_id, NEW.version);

    RETURN NEW;
  END;
$$;


ALTER FUNCTION "public"."prepare_submission_update"() OWNER TO "postgres";


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


CREATE OR REPLACE FUNCTION "public"."submission_version_cascade"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
  BEGIN
    -- If we have any "updatable games", let's cascade least "recent" version to all relevant submissions
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_type = 'LOCAL TEMPORARY' AND table_name = 'updatable_games') THEN
      UPDATE submission s
      SET version = v.id
      FROM version v
      JOIN updatable_games ug ON v.game = ug.game
      WHERE 
        s.game_id = v.game AND
        s.version IS NULL AND
        v.id IN (SELECT id FROM version WHERE game = v.game ORDER BY sequence ASC LIMIT 1);

      -- Destroy temporary table
      DROP TABLE IF EXISTS updatable_games;
    END IF;

    RETURN NEW;
  END;
$$;


ALTER FUNCTION "public"."submission_version_cascade"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_notify_and_unapprove"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  changed_columns text[];
  current_id int4;
  user_id_for_notif uuid;
  submission_data record;
  row_count int;
BEGIN
  -- Get the profile id of the user performing the UPDATE
  current_id := get_profile_id();

  -- Count the number of affected rows by the UPDATE that caused this trigger
  SELECT COUNT(*) INTO row_count FROM new_table;

  -- Iterate over affected rows
  FOR submission_data IN 
    SELECT 
      nt.*,
      ot.tas AS old_tas,
      ot.submitted_at AS old_submitted_at,
      ot.monkey_id AS old_monkey_id,
      ot.platform_id AS old_platform_id,
      ot.region_id AS old_region_id,
      ot.proof AS old_proof,
      ot.comment AS old_comment,
      ot.live AS old_live,
      ot.mod_note AS old_mod_note,
      ot.version AS old_version,
      ot.level_id AS old_level_id
    FROM new_table nt
    JOIN old_table ot ON nt.id = ot.id 
  LOOP
    -- Determine which updatable columns have changed
    SELECT array_agg(o.key)
    INTO changed_columns
    FROM jsonb_each_text(
      jsonb_build_object(
        'tas', submission_data.tas,
        'submitted_at', submission_data.submitted_at,
        'monkey_id', submission_data.monkey_id,
        'platform_id', submission_data.platform_id,
        'region_id', submission_data.region_id,
        'proof', submission_data.proof,
        'comment', submission_data.comment,
        'live', submission_data.live,
        'mod_note', submission_data.mod_note,
        'version', submission_data.version,
        'level_id', submission_data.level_id
      )
    ) AS o
    CROSS JOIN jsonb_each_text(
      jsonb_build_object(
        'tas', submission_data.old_tas,
        'submitted_at', submission_data.old_submitted_at,
        'monkey_id', submission_data.old_monkey_id,
        'platform_id', submission_data.old_platform_id,
        'region_id', submission_data.old_region_id,
        'proof', submission_data.old_proof,
        'comment', submission_data.old_comment,
        'live', submission_data.old_live,
        'mod_note', submission_data.old_mod_note,
        'version', submission_data.old_version,
        'level_id', submission_data.old_level_id
      )
    ) AS n
    WHERE o.key = n.key AND o.value IS DISTINCT FROM n.value;

    -- If only `level_id` has changed, let continue
    IF changed_columns = ARRAY['level_id'] THEN
      CONTINUE;
    END IF;

    -- If we are performing a bulk update on a set of submissions, the only column changed is `version`, and the current
    -- user is an admin, we can assume the user is adding a new version. In this case, we can ignore notifications, unapprovals, etc.
    IF (
      row_count > 1 AND
      changed_columns = ARRAY['version'] AND
      is_admin()
    ) THEN
      CONTINUE;
    END IF;

    -- Fetch submission's profile's `user_id`
    SELECT user_id into user_id_for_notif
    FROM profile
    WHERE id = submission_data.profile_id;

    -- if the submission being updated belongs to an authenticated user, AND the profile_id is not the same as the current_id, we need to send an UPDATE notification
    IF user_id_for_notif IS NOT NULL AND submission_data.profile_id <> current_id then
      INSERT INTO notification (
        submission_id,
        game_id,
        level_id,
        category,
        score,
        record,
        profile_id,
        creator_id,
        notif_type,
        tas,
        submitted_at,
        region_id,
        monkey_id,
        platform_id,
        proof,
        live,
        comment,
        mod_note,
        version_id
      )
      VALUES (
        submission_data.id,
        submission_data.game_id,
        submission_data.level_id,
        submission_data.category,
        submission_data.score,
        submission_data.record,
        submission_data.profile_id,
        current_id,
        'update',
        submission_data.old_tas,
        submission_data.old_submitted_at,
        submission_data.old_region_id,
        submission_data.old_monkey_id,
        submission_data.old_platform_id,
        submission_data.old_proof,
        submission_data.old_live,
        submission_data.old_comment,
        submission_data.old_mod_note,
        submission_data.old_version
      );
    END IF;
    
    -- next, let's delete any approval of the submission, if there is one
    DELETE from approve
    WHERE submission_id = submission_data.id;
  END LOOP;

  RETURN NULL;
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


CREATE OR REPLACE FUNCTION "public"."validate_version_and_updatable_games"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
  BEGIN
    -- Mark game as needing an update if it's the first new version
    IF NOT EXISTS (SELECT 1 FROM version WHERE game = NEW.game) THEN
      CREATE TEMPORARY TABLE IF NOT EXISTS updatable_games (
        game text PRIMARY KEY
      );

      INSERT INTO updatable_games (game)
      VALUES (NEW.game)
      ON CONFLICT DO NOTHING;
    END IF;

    RETURN NEW;
  END;
$$;


ALTER FUNCTION "public"."validate_version_and_updatable_games"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."validate_video_url"("url" "text") RETURNS boolean
    LANGUAGE "sql"
    AS $_$
  SELECT CASE 
    WHEN url ~ '^((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube\.com|youtu.be))(\/(?:[\w\-]+\?v=|embed\/|v\/)?)([\w\-]+)(\S+)?$' THEN TRUE
    WHEN url ~ '^(?:https?:\/\/)?(?:www\.)?(?:twitch\.tv\/(?:videos\/(\d{7,11})(?:\?t=([\dhms]+))?[^\s&]*(?:\?[\w=&-]*)?|[a-zA-Z0-9][\w]{2,24}\/clip\/([a-zA-Z0-9_-]+)(?:\?[\w=&-]*)?)|clips\.twitch\.tv\/([a-zA-Z0-9_-]+))(?:\?[\w=&-]*)?$' THEN TRUE
    WHEN url ~ '^(?:https?:\/\/)?(?:www\.)?(?:twitter\.com|x\.com)\/(?:#!\/)?(\w+)\/status(?:es)?\/(\d+)[/\S]*$' THEN TRUE
    WHEN url ~ '^(?:https?:\/\/)?(?:i\.)?(?:www\.)?(?:imgur\.com\/)?(?:a\/)?([a-zA-Z0-9]{7})(?:\.mp4)?$' THEN TRUE
    WHEN url ~ '^(?:https?:\/\/)?drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)(?:\/[^/?]+)?(?:\?.*)?$' THEN TRUE
    ELSE FALSE
  END
$_$;


ALTER FUNCTION "public"."validate_video_url"("url" "text") OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."administrator" (
    "profile_id" integer NOT NULL
);


ALTER TABLE "public"."administrator" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."approve" (
    "approve_date" timestamp with time zone DEFAULT "now"() NOT NULL,
    "submission_id" timestamp with time zone NOT NULL,
    "creator_id" integer NOT NULL,
    CONSTRAINT "approve_approve_date_check" CHECK (("approve_date" = "now"()))
);


ALTER TABLE "public"."approve" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."category" (
    "abb" character varying(15) NOT NULL,
    "name" character varying(50) NOT NULL,
    "practice" boolean NOT NULL,
    "id" integer NOT NULL,
    CONSTRAINT "category_abb_format" CHECK ((("abb")::"text" ~ '^[a-z0-9][a-z0-9_]*$'::"text")),
    CONSTRAINT "category_id_check" CHECK (("id" > 0)),
    CONSTRAINT "category_non_empty_name" CHECK (("length"(("name")::"text") > 0))
);


ALTER TABLE "public"."category" OWNER TO "postgres";


ALTER TABLE "public"."category" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."category_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."countries" (
    "name" "text",
    "iso2" "text" NOT NULL
);


ALTER TABLE "public"."countries" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."game" (
    "abb" "text" NOT NULL,
    "name" character varying(256) NOT NULL,
    "custom" boolean NOT NULL,
    "release_date" "date" NOT NULL,
    "creator" integer,
    "download" "text",
    "live_preference" boolean NOT NULL,
    "min_date" "date" NOT NULL,
    CONSTRAINT "game_abb_constraint" CHECK (("abb" ~ '^[a-z0-9]{1,12}$'::"text")),
    CONSTRAINT "game_date_constraint" CHECK (("min_date" <= "release_date")),
    CONSTRAINT "game_download_constraint" CHECK ((("download" IS NULL) OR ("length"("download") > 0))),
    CONSTRAINT "game_name_constraint" CHECK (("length"(("name")::"text") > 0))
);


ALTER TABLE "public"."game" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."game_monkey" (
    "game" "text" NOT NULL,
    "monkey" integer NOT NULL,
    "id" integer NOT NULL
);


ALTER TABLE "public"."game_monkey" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."game_platform" (
    "game" "text" NOT NULL,
    "platform" integer NOT NULL,
    "id" integer NOT NULL
);


ALTER TABLE "public"."game_platform" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."game_profile" (
    "game" "text" NOT NULL,
    "profile" integer NOT NULL
);


ALTER TABLE "public"."game_profile" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."game_region" (
    "game" "text" NOT NULL,
    "region" integer NOT NULL,
    "id" integer NOT NULL
);


ALTER TABLE "public"."game_region" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."game_rule" (
    "abb" "text" NOT NULL,
    "rule" integer NOT NULL,
    "id" integer NOT NULL
);


ALTER TABLE "public"."game_rule" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."goal" (
    "id" integer NOT NULL,
    "name" character varying(15) NOT NULL,
    "color" character varying(7) NOT NULL,
    CONSTRAINT "goal_color_content_constraint" CHECK ((("color")::"text" ~ '^#[a-f0-9]{6}$'::"text")),
    CONSTRAINT "goal_name_content_constraint" CHECK ((("length"(("name")::"text") > 0) AND (("name")::"text" ~ '^[a-z]+$'::"text")))
);


ALTER TABLE "public"."goal" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."goal_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."goal_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."goal_id_seq" OWNED BY "public"."goal"."id";



CREATE TABLE IF NOT EXISTS "public"."level" (
    "id" integer NOT NULL,
    "game" "text" NOT NULL,
    "mode" "text" NOT NULL,
    "name" "text" NOT NULL,
    "chart_type" "public"."chart_t" NOT NULL,
    "time" real NOT NULL,
    "category" "text" NOT NULL,
    "timer_type" "public"."timer_t",
    "ascending" "public"."chart_t",
    CONSTRAINT "name_url_valid" CHECK (("public"."is_url_safe"("name") AND ("length"("name") > 0))),
    CONSTRAINT "score_chart_restrictions" CHECK ((("chart_type" <> 'score'::"public"."chart_t") OR (("timer_type" IS NULL) AND ("time" = (0)::double precision) AND ("ascending" <> ALL (ARRAY['both'::"public"."chart_t", 'time'::"public"."chart_t"]))))),
    CONSTRAINT "time_both_chart_restrictions" CHECK ((("chart_type" = 'score'::"public"."chart_t") OR (("timer_type" IS NOT NULL) AND (("ascending" = 'score'::"public"."chart_t") OR ("ascending" IS NULL) OR ("time" = (0)::double precision))))),
    CONSTRAINT "time_chart_restrictions" CHECK ((("chart_type" <> 'time'::"public"."chart_t") OR ("ascending" <> ALL (ARRAY['both'::"public"."chart_t", 'score'::"public"."chart_t"]))))
);


ALTER TABLE "public"."level" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."mode" (
    "game" "text" NOT NULL,
    "name" "text" NOT NULL,
    "id" integer,
    "category" "text" NOT NULL,
    CONSTRAINT "name_url_valid" CHECK (("public"."is_url_safe"("name") AND ("length"("name") > 0)))
);


ALTER TABLE "public"."mode" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."monkey" (
    "id" integer NOT NULL,
    "monkey_name" character varying(20) NOT NULL,
    CONSTRAINT "monkey_name_constraint" CHECK (("length"(("monkey_name")::"text") > 0))
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
    "category" "text" NOT NULL,
    "platform_id" integer,
    "tas" boolean NOT NULL,
    "report_id" timestamp with time zone,
    "mod_note" character varying(100),
    "version_id" integer,
    CONSTRAINT "notification_report_constraint" CHECK ((("notif_type" = 'report'::"public"."notif_t") OR (("notif_type" <> 'report'::"public"."notif_t") AND ("report_id" IS NULL))))
);


ALTER TABLE "public"."notification" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."platform" (
    "id" integer NOT NULL,
    "platform_name" character varying(30) NOT NULL,
    "platform_abb" character varying(10) NOT NULL,
    CONSTRAINT "platform_abb_constraint" CHECK (("length"(("platform_abb")::"text") > 0)),
    CONSTRAINT "platform_name_constraint" CHECK (("length"(("platform_name")::"text") > 0))
);


ALTER TABLE "public"."platform" OWNER TO "postgres";


ALTER TABLE "public"."platform" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."platform_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."post" (
    "id" integer NOT NULL,
    "title" character varying(200) NOT NULL,
    "body" character varying(3000) NOT NULL,
    "posted_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "link" character varying(256),
    "profile_id" integer NOT NULL,
    "link_description" character varying(100),
    CONSTRAINT "link_and_description_check" CHECK (((("link" IS NULL) OR (("link")::"text" = ''::"text")) = (("link_description" IS NULL) OR (("link_description")::"text" = ''::"text")))),
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


ALTER SEQUENCE "public"."post_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."post_id_seq" OWNED BY "public"."post"."id";



CREATE TABLE IF NOT EXISTS "public"."profile" (
    "id" integer NOT NULL,
    "user_id" "uuid",
    "username" "extensions"."citext" NOT NULL,
    "youtube_handle" character varying(31) DEFAULT ''::"text",
    "twitch_username" character varying(25) DEFAULT ''::"text",
    "country" "text",
    "discord" character varying(32) DEFAULT ''::"text",
    "bio" character varying(200) DEFAULT ''::"text",
    "birthday" "date",
    "featured_video" "text" DEFAULT ''::"text",
    "video_description" character varying(200) DEFAULT ''::"text",
    "twitter_handle" character varying(16) DEFAULT ''::"text",
    "report_token" integer DEFAULT 10 NOT NULL,
    CONSTRAINT "check_birthday_range" CHECK ((("birthday" >= '1900-01-01'::"date") AND ("birthday" <= CURRENT_DATE))),
    CONSTRAINT "profile_discord_format" CHECK ((("discord" IS NULL) OR (("discord")::"text" = ''::"text") OR (("discord")::"text" ~ '^(?!.*\.{2})[a-z0-9_.]{2,32}$'::"text"))),
    CONSTRAINT "profile_featured_video_check" CHECK ((("featured_video" IS NULL) OR ("featured_video" = ''::"text") OR "public"."validate_video_url"("featured_video"))),
    CONSTRAINT "profile_twitch_username_check" CHECK ((("twitch_username" IS NULL) OR (("twitch_username")::"text" = ''::"text") OR (("twitch_username")::"text" ~ '^[a-zA-Z0-9][\w]{1,23}$'::"text"))),
    CONSTRAINT "profile_twitter_handle_check" CHECK ((("twitter_handle" IS NULL) OR (("twitter_handle")::"text" = ''::"text") OR (("twitter_handle")::"text" ~ '^@[\w]{4,15}$'::"text"))),
    CONSTRAINT "profile_username_format" CHECK (("username" OPERATOR("extensions".~) '^[A-Za-z0-9][\w]{2,15}$'::"extensions"."citext")),
    CONSTRAINT "profile_video_description_check" CHECK (((("featured_video" IS NOT NULL) AND ("featured_video" <> ''::"text")) OR (("video_description" IS NULL) OR (("video_description")::"text" = ''::"text")))),
    CONSTRAINT "profile_youtube_handle_format" CHECK ((("youtube_handle" IS NULL) OR (("youtube_handle")::"text" = ''::"text") OR (("youtube_handle")::"text" ~ '^@[\w.-]{3,30}$'::"text")))
);


ALTER TABLE "public"."profile" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."profile_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."profile_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."profile_id_seq" OWNED BY "public"."profile"."id";



CREATE TABLE IF NOT EXISTS "public"."region" (
    "id" integer NOT NULL,
    "region_name" character varying(10) NOT NULL,
    CONSTRAINT "region_name_constraint" CHECK (("length"(("region_name")::"text") > 0))
);


ALTER TABLE "public"."region" OWNER TO "postgres";


ALTER TABLE "public"."region" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."region_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."report" (
    "report_date" timestamp with time zone DEFAULT "now"() NOT NULL,
    "submission_id" timestamp with time zone NOT NULL,
    "message" character varying(100) NOT NULL,
    "creator_id" integer NOT NULL
);


ALTER TABLE "public"."report" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."rule" (
    "id" integer NOT NULL,
    "rule_name" character varying(1024) NOT NULL,
    CONSTRAINT "rule_name_constraint" CHECK (("length"(("rule_name")::"text") > 0))
);


ALTER TABLE "public"."rule" OWNER TO "postgres";


ALTER TABLE "public"."rule" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."rule_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."version" (
    "id" integer NOT NULL,
    "game" "text" NOT NULL,
    "version" character varying(10) NOT NULL,
    "sequence" integer NOT NULL,
    CONSTRAINT "version_version_constraint" CHECK ((("version")::"text" ~ '^[a-zA-Z0-9][a-zA-Z0-9.]{0,9}$'::"text"))
);


ALTER TABLE "public"."version" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."version_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."version_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."version_id_seq" OWNED BY "public"."version"."id";



ALTER TABLE ONLY "public"."goal" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."goal_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."post" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."post_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."profile" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."profile_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."version" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."version_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."approve"
    ADD CONSTRAINT "approve_pkey" PRIMARY KEY ("approve_date");



ALTER TABLE ONLY "public"."approve"
    ADD CONSTRAINT "approve_unique_submission" UNIQUE ("submission_id");



ALTER TABLE ONLY "public"."category"
    ADD CONSTRAINT "category_pkey" PRIMARY KEY ("abb");



ALTER TABLE ONLY "public"."category"
    ADD CONSTRAINT "category_unique_constraint" UNIQUE ("name", "practice");



ALTER TABLE ONLY "public"."countries"
    ADD CONSTRAINT "countries_pkey" PRIMARY KEY ("iso2");



ALTER TABLE ONLY "public"."game"
    ADD CONSTRAINT "game_pkey" PRIMARY KEY ("abb");



ALTER TABLE ONLY "public"."game_profile"
    ADD CONSTRAINT "game_profile_pkey" PRIMARY KEY ("game", "profile");



ALTER TABLE ONLY "public"."goal"
    ADD CONSTRAINT "goal_color_key" UNIQUE ("color");



ALTER TABLE ONLY "public"."goal"
    ADD CONSTRAINT "goal_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."goal"
    ADD CONSTRAINT "goal_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."level"
    ADD CONSTRAINT "level_pkey" PRIMARY KEY ("game", "name", "category");



ALTER TABLE ONLY "public"."mode"
    ADD CONSTRAINT "mode_pkey" PRIMARY KEY ("game", "name", "category");



ALTER TABLE ONLY "public"."administrator"
    ADD CONSTRAINT "moderator_pkey" PRIMARY KEY ("profile_id");



ALTER TABLE ONLY "public"."monkey"
    ADD CONSTRAINT "monkey_name_key" UNIQUE ("monkey_name");



ALTER TABLE ONLY "public"."monkey"
    ADD CONSTRAINT "monkey_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."notification"
    ADD CONSTRAINT "notification_pkey1" PRIMARY KEY ("notif_date");



ALTER TABLE ONLY "public"."platform"
    ADD CONSTRAINT "platform_abb_key" UNIQUE ("platform_abb");



ALTER TABLE ONLY "public"."platform"
    ADD CONSTRAINT "platform_name_key" UNIQUE ("platform_name");



ALTER TABLE ONLY "public"."platform"
    ADD CONSTRAINT "platform_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."post"
    ADD CONSTRAINT "post_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profile"
    ADD CONSTRAINT "profile_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profile"
    ADD CONSTRAINT "profile_user_id_key" UNIQUE ("user_id");



ALTER TABLE ONLY "public"."profile"
    ADD CONSTRAINT "profile_username_key" UNIQUE ("username");



ALTER TABLE ONLY "public"."region"
    ADD CONSTRAINT "region_name_key" UNIQUE ("region_name");



ALTER TABLE ONLY "public"."region"
    ADD CONSTRAINT "region_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."report"
    ADD CONSTRAINT "report_pkey" PRIMARY KEY ("report_date");



ALTER TABLE ONLY "public"."report"
    ADD CONSTRAINT "report_unique_submission" UNIQUE ("submission_id");



ALTER TABLE ONLY "public"."submission"
    ADD CONSTRAINT "submission_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."rule"
    ADD CONSTRAINT "temp_pkey1" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."rule"
    ADD CONSTRAINT "temp_rule_name_key" UNIQUE ("rule_name");



ALTER TABLE ONLY "public"."game_rule"
    ADD CONSTRAINT "unique_game_id" UNIQUE ("abb", "id");



ALTER TABLE ONLY "public"."version"
    ADD CONSTRAINT "version_game_version_key" UNIQUE ("game", "version");



ALTER TABLE ONLY "public"."version"
    ADD CONSTRAINT "version_pkey" PRIMARY KEY ("id");



CREATE OR REPLACE TRIGGER "approve_after_insert_row_trigger" AFTER INSERT ON "public"."approve" FOR EACH ROW EXECUTE FUNCTION "public"."approve_notify"();



CREATE OR REPLACE TRIGGER "report_after_delete_row_trigger" AFTER DELETE ON "public"."report" FOR EACH ROW EXECUTE FUNCTION "public"."approve_submission"();



CREATE OR REPLACE TRIGGER "report_after_insert_row_trigger" AFTER INSERT ON "public"."report" FOR EACH ROW EXECUTE FUNCTION "public"."insert_notify_and_unapprove"();



CREATE OR REPLACE TRIGGER "report_before_insert_row_trigger" BEFORE INSERT ON "public"."report" FOR EACH ROW EXECUTE FUNCTION "public"."decrement_report_token"();



CREATE OR REPLACE TRIGGER "submission_after_insert_row_trigger" AFTER INSERT ON "public"."submission" FOR EACH ROW EXECUTE FUNCTION "public"."insert_notify"();



CREATE OR REPLACE TRIGGER "submission_after_update_statement_trigger" AFTER UPDATE ON "public"."submission" REFERENCING OLD TABLE AS "old_table" NEW TABLE AS "new_table" FOR EACH STATEMENT EXECUTE FUNCTION "public"."update_notify_and_unapprove"();



CREATE OR REPLACE TRIGGER "submission_before_insert_row_trigger" BEFORE INSERT ON "public"."submission" FOR EACH ROW EXECUTE FUNCTION "public"."prepare_submission_insert"();



CREATE OR REPLACE TRIGGER "submission_before_update_row_trigger" BEFORE UPDATE ON "public"."submission" FOR EACH ROW EXECUTE FUNCTION "public"."prepare_submission_update"();



CREATE OR REPLACE TRIGGER "version_after_insert_statement_trigger" AFTER INSERT ON "public"."version" FOR EACH STATEMENT EXECUTE FUNCTION "public"."submission_version_cascade"();



CREATE OR REPLACE TRIGGER "version_before_insert_row_trigger" BEFORE INSERT ON "public"."version" FOR EACH ROW EXECUTE FUNCTION "public"."validate_version_and_updatable_games"();



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



ALTER TABLE ONLY "public"."game_profile"
    ADD CONSTRAINT "game_profile_game_fkey" FOREIGN KEY ("game") REFERENCES "public"."game"("abb");



ALTER TABLE ONLY "public"."game_profile"
    ADD CONSTRAINT "game_profile_profile_fkey" FOREIGN KEY ("profile") REFERENCES "public"."profile"("id");



ALTER TABLE ONLY "public"."game_region"
    ADD CONSTRAINT "game_region_game_fkey" FOREIGN KEY ("game") REFERENCES "public"."game"("abb");



ALTER TABLE ONLY "public"."game_region"
    ADD CONSTRAINT "game_region_region_fkey" FOREIGN KEY ("region") REFERENCES "public"."region"("id");



ALTER TABLE ONLY "public"."game_rule"
    ADD CONSTRAINT "game_rule_abb_fkey" FOREIGN KEY ("abb") REFERENCES "public"."game"("abb");



ALTER TABLE ONLY "public"."game_rule"
    ADD CONSTRAINT "game_rule_rule_fkey" FOREIGN KEY ("rule") REFERENCES "public"."rule"("id");



ALTER TABLE ONLY "public"."level"
    ADD CONSTRAINT "level_fk" FOREIGN KEY ("game", "mode", "category") REFERENCES "public"."mode"("game", "name", "category") MATCH FULL;



ALTER TABLE ONLY "public"."mode"
    ADD CONSTRAINT "mode_category_fk" FOREIGN KEY ("category") REFERENCES "public"."category"("abb");



ALTER TABLE ONLY "public"."mode"
    ADD CONSTRAINT "mode_game_fkey" FOREIGN KEY ("game") REFERENCES "public"."game"("abb");



ALTER TABLE ONLY "public"."administrator"
    ADD CONSTRAINT "moderator_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "public"."profile"("id");



ALTER TABLE ONLY "public"."notification"
    ADD CONSTRAINT "notification_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "public"."profile"("id");



ALTER TABLE ONLY "public"."notification"
    ADD CONSTRAINT "notification_level_fk" FOREIGN KEY ("game_id", "level_id", "category") REFERENCES "public"."level"("game", "name", "category") MATCH FULL ON UPDATE CASCADE;



ALTER TABLE ONLY "public"."notification"
    ADD CONSTRAINT "notification_monkey_id_fk" FOREIGN KEY ("monkey_id") REFERENCES "public"."monkey"("id");



ALTER TABLE ONLY "public"."notification"
    ADD CONSTRAINT "notification_platform_id_fkey" FOREIGN KEY ("platform_id") REFERENCES "public"."platform"("id");



ALTER TABLE ONLY "public"."notification"
    ADD CONSTRAINT "notification_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "public"."profile"("id");



ALTER TABLE ONLY "public"."notification"
    ADD CONSTRAINT "notification_region_id_fk" FOREIGN KEY ("region_id") REFERENCES "public"."region"("id");



ALTER TABLE ONLY "public"."notification"
    ADD CONSTRAINT "notification_report_id_fkey" FOREIGN KEY ("report_id") REFERENCES "public"."report"("report_date") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."notification"
    ADD CONSTRAINT "notification_submission_id_fkey" FOREIGN KEY ("submission_id") REFERENCES "public"."submission"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."notification"
    ADD CONSTRAINT "notification_version_id_fkey" FOREIGN KEY ("version_id") REFERENCES "public"."version"("id");



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
    ADD CONSTRAINT "submission_level_fk" FOREIGN KEY ("game_id", "level_id", "category") REFERENCES "public"."level"("game", "name", "category") MATCH FULL ON UPDATE CASCADE;



ALTER TABLE ONLY "public"."submission"
    ADD CONSTRAINT "submission_monkey_id_fkey" FOREIGN KEY ("monkey_id") REFERENCES "public"."monkey"("id");



ALTER TABLE ONLY "public"."submission"
    ADD CONSTRAINT "submission_platform_id_fkey" FOREIGN KEY ("platform_id") REFERENCES "public"."platform"("id");



ALTER TABLE ONLY "public"."submission"
    ADD CONSTRAINT "submission_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "public"."profile"("id");



ALTER TABLE ONLY "public"."submission"
    ADD CONSTRAINT "submission_region_id_fkey" FOREIGN KEY ("region_id") REFERENCES "public"."region"("id");



ALTER TABLE ONLY "public"."submission"
    ADD CONSTRAINT "submission_version_fk" FOREIGN KEY ("version") REFERENCES "public"."version"("id");



ALTER TABLE ONLY "public"."version"
    ADD CONSTRAINT "version_game_fkey" FOREIGN KEY ("game") REFERENCES "public"."game"("abb");



CREATE POLICY "Enable admin delete for unapproved submissions" ON "public"."submission" FOR DELETE TO "authenticated" USING (("public"."is_admin"() AND (NOT (EXISTS ( SELECT 1
   FROM "public"."approve"
  WHERE ("approve"."submission_id" = "submission"."id"))))));



CREATE POLICY "Enable admins to update version of any submission" ON "public"."submission" FOR UPDATE TO "authenticated" USING ("public"."is_admin"()) WITH CHECK ("public"."is_only_version_changed"("id", "tas", "submitted_at", "monkey_id", "platform_id", "region_id", ("proof")::"text", ("comment")::"text", "live", ("mod_note")::"text", "version"));



CREATE POLICY "Enable authenticated users to delete rows they own" ON "public"."notification" FOR DELETE TO "authenticated" USING (("profile_id" = "public"."get_profile_id"()));



CREATE POLICY "Enable authenticated users to select their own rows" ON "public"."notification" FOR SELECT TO "authenticated" USING (("profile_id" = "public"."get_profile_id"()));



CREATE POLICY "Enable delete for administrators" ON "public"."game_profile" FOR DELETE TO "authenticated" USING ("public"."is_admin"());



CREATE POLICY "Enable delete for administrators" ON "public"."report" FOR DELETE TO "authenticated" USING ("public"."is_admin"());



CREATE POLICY "Enable delete for moderators who are unrelated to the report" ON "public"."report" FOR DELETE TO "authenticated" USING (("public"."is_moderator"(( SELECT "submission"."game_id"
   FROM "public"."submission"
  WHERE ("submission"."id" = "report"."submission_id"))) AND ("creator_id" <> "public"."get_profile_id"()) AND (( SELECT "submission"."profile_id"
   FROM "public"."submission"
  WHERE ("submission"."id" = "report"."submission_id")) <> "public"."get_profile_id"())));



CREATE POLICY "Enable insert for administrators" ON "public"."category" FOR INSERT TO "authenticated" WITH CHECK ("public"."is_admin"());



CREATE POLICY "Enable insert for administrators" ON "public"."game" FOR INSERT TO "authenticated" WITH CHECK ("public"."is_admin"());



CREATE POLICY "Enable insert for administrators" ON "public"."game_monkey" FOR INSERT TO "authenticated" WITH CHECK ("public"."is_admin"());



CREATE POLICY "Enable insert for administrators" ON "public"."game_platform" FOR INSERT TO "authenticated" WITH CHECK ("public"."is_admin"());



CREATE POLICY "Enable insert for administrators" ON "public"."game_profile" FOR INSERT TO "authenticated" WITH CHECK ("public"."is_admin"());



CREATE POLICY "Enable insert for administrators" ON "public"."game_region" FOR INSERT TO "authenticated" WITH CHECK ("public"."is_admin"());



CREATE POLICY "Enable insert for administrators" ON "public"."game_rule" FOR INSERT TO "authenticated" WITH CHECK ("public"."is_admin"());



CREATE POLICY "Enable insert for administrators" ON "public"."goal" FOR INSERT TO "authenticated" WITH CHECK ("public"."is_admin"());



CREATE POLICY "Enable insert for administrators" ON "public"."level" FOR INSERT TO "authenticated" WITH CHECK ("public"."is_admin"());



CREATE POLICY "Enable insert for administrators" ON "public"."mode" FOR INSERT TO "authenticated" WITH CHECK ("public"."is_admin"());



CREATE POLICY "Enable insert for administrators" ON "public"."monkey" FOR INSERT TO "authenticated" WITH CHECK ("public"."is_admin"());



CREATE POLICY "Enable insert for administrators" ON "public"."platform" FOR INSERT TO "authenticated" WITH CHECK ("public"."is_admin"());



CREATE POLICY "Enable insert for administrators" ON "public"."post" FOR INSERT TO "authenticated" WITH CHECK (("public"."is_admin"() AND ("profile_id" = "public"."get_profile_id"()) AND ("posted_at" = "now"())));



CREATE POLICY "Enable insert for administrators" ON "public"."region" FOR INSERT TO "authenticated" WITH CHECK ("public"."is_admin"());



CREATE POLICY "Enable insert for administrators" ON "public"."rule" FOR INSERT TO "authenticated" WITH CHECK ("public"."is_admin"());



CREATE POLICY "Enable insert for admins, & authenticated users their own row" ON "public"."profile" FOR INSERT TO "authenticated" WITH CHECK ((("auth"."uid"() = "user_id") OR "public"."is_admin"()));



CREATE POLICY "Enable insert for authenticated users" ON "public"."report" FOR INSERT TO "authenticated" WITH CHECK (("creator_id" = "public"."get_profile_id"()));



CREATE POLICY "Enable insert for moderators" ON "public"."notification" FOR INSERT TO "authenticated" WITH CHECK ("public"."is_moderator"("game_id"));



CREATE POLICY "Enable insert for moderators" ON "public"."submission" FOR INSERT TO "authenticated" WITH CHECK ("public"."is_moderator"("game_id"));



CREATE POLICY "Enable mod delete for unapproved/irrelevant report submissions" ON "public"."submission" FOR DELETE TO "authenticated" USING (("public"."is_moderator"("game_id") AND (NOT (EXISTS ( SELECT 1
   FROM "public"."approve"
  WHERE ("approve"."submission_id" = "submission"."id")))) AND (NOT (EXISTS ( SELECT 1
   FROM "public"."report"
  WHERE (("report"."submission_id" = "submission"."id") AND ("report"."creator_id" = "public"."get_profile_id"()))))) AND (NOT ((EXISTS ( SELECT 1
   FROM "public"."report"
  WHERE ("report"."submission_id" = "submission"."id"))) AND ("profile_id" = "public"."get_profile_id"())))));



CREATE POLICY "Enable mod updates for unapproved submissions" ON "public"."submission" FOR UPDATE TO "authenticated" USING (("public"."is_moderator"("game_id") AND (NOT (EXISTS ( SELECT 1
   FROM "public"."approve"
  WHERE ("approve"."submission_id" = "submission"."id")))))) WITH CHECK (("public"."is_moderator"("game_id") AND (NOT (EXISTS ( SELECT 1
   FROM "public"."approve"
  WHERE ("approve"."submission_id" = "submission"."id"))))));



CREATE POLICY "Enable normal users to insert their own submissions" ON "public"."submission" FOR INSERT TO "authenticated" WITH CHECK ((("profile_id" = "public"."get_profile_id"()) AND (("mod_note")::"text" = ''::"text")));



CREATE POLICY "Enable read acccess for all users" ON "public"."category" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."administrator" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."approve" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."countries" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."game" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."game_monkey" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."game_platform" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."game_profile" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."game_region" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."game_rule" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."goal" USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."level" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."mode" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."monkey" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."platform" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."post" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."profile" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."region" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."report" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."rule" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."submission" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."version" USING (true);



CREATE POLICY "Enable restricted approvals for moderators" ON "public"."approve" FOR INSERT TO "authenticated" WITH CHECK (("public"."is_moderator"(( SELECT "submission"."game_id"
   FROM "public"."submission"
  WHERE ("submission"."id" = "approve"."submission_id"))) AND (NOT "public"."report_exists"("submission_id"))));



CREATE POLICY "Enable restricted insert access for users" ON "public"."notification" FOR INSERT TO "authenticated" WITH CHECK ((("notif_type" = 'report'::"public"."notif_t") AND (EXISTS ( SELECT 1
   FROM "public"."submission"
  WHERE (("submission"."id" = "notification"."submission_id") AND ("submission"."game_id" = "notification"."game_id") AND ("submission"."level_id" = "notification"."level_id") AND ("submission"."category" = "notification"."category") AND ("submission"."score" = "notification"."score") AND ("submission"."tas" = "notification"."tas") AND ("submission"."record" = "notification"."record") AND ("submission"."profile_id" = "notification"."profile_id") AND ((("submission"."version" IS NULL) AND ("notification"."version_id" IS NULL)) OR ("submission"."version" = "notification"."version_id"))))) AND (EXISTS ( SELECT 1
   FROM "public"."report"
  WHERE (("report"."submission_id" = "notification"."submission_id") AND (("report"."message")::"text" = ("notification"."message")::"text") AND ("report"."creator_id" = "notification"."creator_id")))) AND (NOT "public"."is_already_notified"("report_id"))));



CREATE POLICY "Enable restricted unapprovals" ON "public"."approve" FOR DELETE TO "authenticated" USING (("public"."report_exists"("submission_id") OR ("public"."get_profile_id"() = ( SELECT "submission"."profile_id"
   FROM "public"."submission"
  WHERE ("submission"."id" = "approve"."submission_id")))));



CREATE POLICY "Enable update for authenticated users based on user ID" ON "public"."profile" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "user_id")) WITH CHECK ((("auth"."uid"() = "user_id") AND "public"."regulate_report_token"("report_token")));



CREATE POLICY "Enable users to update rows they own, except mod_note attribute" ON "public"."submission" FOR UPDATE TO "authenticated" USING (("profile_id" = "public"."get_profile_id"())) WITH CHECK ((("profile_id" = "public"."get_profile_id"()) AND (NOT "public"."has_mod_note_changed"("id", "mod_note"))));



CREATE POLICY "Enforce receiving profile exists [RESTRICTIVE]" ON "public"."notification" AS RESTRICTIVE FOR INSERT TO "authenticated" WITH CHECK (((EXISTS ( SELECT 1
   FROM "public"."profile"
  WHERE (("profile"."id" = "notification"."profile_id") AND ("profile"."user_id" IS NOT NULL)))) AND ("creator_id" = "public"."get_profile_id"())));



CREATE POLICY "Insert restrictions [RESTRICTIVE]" ON "public"."submission" AS RESTRICTIVE FOR INSERT TO "authenticated" WITH CHECK ((("id" = "now"()) AND
CASE "public"."get_chart_type"("game_id", "level_id")
    WHEN 'both'::"text" THEN true
    WHEN 'score'::"text" THEN "score"
    WHEN 'time'::"text" THEN (NOT "score")
    ELSE false
END AND "public"."valid_monkey_platform_region"("game_id", "monkey_id", "platform_id", "region_id") AND ("submitted_at" >= ( SELECT "game"."min_date"
   FROM "public"."game"
  WHERE ("game"."abb" = "submission"."game_id")))));



CREATE POLICY "Update restrictions [RESTRICTIVE]" ON "public"."submission" AS RESTRICTIVE FOR UPDATE TO "authenticated" USING (true) WITH CHECK (("public"."valid_monkey_platform_region"("game_id", "monkey_id", "platform_id", "region_id") AND ("submitted_at" >= ( SELECT "game"."min_date"
   FROM "public"."game"
  WHERE ("game"."abb" = "submission"."game_id")))));



ALTER TABLE "public"."administrator" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."approve" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."category" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."countries" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."game" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."game_monkey" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."game_platform" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."game_profile" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."game_region" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."game_rule" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."goal" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."level" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."mode" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."monkey" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."notification" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."platform" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."post" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profile" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."region" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."report" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."rule" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."submission" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."version" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";








REVOKE USAGE ON SCHEMA "public" FROM PUBLIC;
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";



















































































































































































































































































































































GRANT ALL ON FUNCTION "public"."add_game"("game" "jsonb", "modes" "jsonb", "levels" "jsonb", "game_monkeys" "jsonb", "game_platforms" "jsonb", "game_profiles" "jsonb", "game_regions" "jsonb", "game_rules" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."add_game"("game" "jsonb", "modes" "jsonb", "levels" "jsonb", "game_monkeys" "jsonb", "game_platforms" "jsonb", "game_profiles" "jsonb", "game_regions" "jsonb", "game_rules" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."add_game"("game" "jsonb", "modes" "jsonb", "levels" "jsonb", "game_monkeys" "jsonb", "game_platforms" "jsonb", "game_profiles" "jsonb", "game_regions" "jsonb", "game_rules" "jsonb") TO "service_role";



GRANT ALL ON FUNCTION "public"."add_versions"("versions" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."add_versions"("versions" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."add_versions"("versions" "jsonb") TO "service_role";



GRANT ALL ON FUNCTION "public"."approve_notify"() TO "anon";
GRANT ALL ON FUNCTION "public"."approve_notify"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."approve_notify"() TO "service_role";



GRANT ALL ON FUNCTION "public"."approve_submission"() TO "anon";
GRANT ALL ON FUNCTION "public"."approve_submission"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."approve_submission"() TO "service_role";



GRANT ALL ON PROCEDURE "public"."check_submission_version"(IN "game_id" "text", IN "version_id" integer) TO "anon";
GRANT ALL ON PROCEDURE "public"."check_submission_version"(IN "game_id" "text", IN "version_id" integer) TO "authenticated";
GRANT ALL ON PROCEDURE "public"."check_submission_version"(IN "game_id" "text", IN "version_id" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."decrement_report_token"() TO "anon";
GRANT ALL ON FUNCTION "public"."decrement_report_token"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."decrement_report_token"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_category_levels_by_mode"("game_name" "text", "category_name" "text", "is_score" boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."get_category_levels_by_mode"("game_name" "text", "category_name" "text", "is_score" boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_category_levels_by_mode"("game_name" "text", "category_name" "text", "is_score" boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_category_time"("game_name" "text", "category_name" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."get_category_time"("game_name" "text", "category_name" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_category_time"("game_name" "text", "category_name" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_chart_submissions"("game" "text", "category_name" "text", "level" "text", "is_score" boolean, "version_key" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_chart_submissions"("game" "text", "category_name" "text", "level" "text", "is_score" boolean, "version_key" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_chart_submissions"("game" "text", "category_name" "text", "level" "text", "is_score" boolean, "version_key" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_chart_type"("game_id" "text", "level_id" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."get_chart_type"("game_id" "text", "level_id" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_chart_type"("game_id" "text", "level_id" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_chart_types"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_chart_types"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_chart_types"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_medals"("abb" "text", "category" "text", "score" boolean, "version" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_medals"("abb" "text", "category" "text", "score" boolean, "version" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_medals"("abb" "text", "category" "text", "score" boolean, "version" integer) TO "service_role";



GRANT ALL ON TABLE "public"."submission" TO "anon";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."submission" TO "authenticated";
GRANT ALL ON TABLE "public"."submission" TO "service_role";



GRANT UPDATE("tas") ON TABLE "public"."submission" TO "authenticated";



GRANT UPDATE("submitted_at") ON TABLE "public"."submission" TO "authenticated";



GRANT UPDATE("monkey_id") ON TABLE "public"."submission" TO "authenticated";



GRANT UPDATE("platform_id") ON TABLE "public"."submission" TO "authenticated";



GRANT UPDATE("region_id") ON TABLE "public"."submission" TO "authenticated";



GRANT UPDATE("proof") ON TABLE "public"."submission" TO "authenticated";



GRANT UPDATE("comment") ON TABLE "public"."submission" TO "authenticated";



GRANT UPDATE("live") ON TABLE "public"."submission" TO "authenticated";



GRANT UPDATE("mod_note") ON TABLE "public"."submission" TO "authenticated";



GRANT UPDATE("version") ON TABLE "public"."submission" TO "authenticated";



GRANT ALL ON FUNCTION "public"."get_position"("newrecord" "public"."submission", "liveonly" boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."get_position"("newrecord" "public"."submission", "liveonly" boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_position"("newrecord" "public"."submission", "liveonly" boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_profile"("p_id" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_profile"("p_id" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_profile"("p_id" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_profile_id"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_profile_id"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_profile_id"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_profiles"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_profiles"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_profiles"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_ranked_submissions"("game_name" "text", "category_name" "text", "is_score" boolean, "live_only" boolean, "version_key" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_ranked_submissions"("game_name" "text", "category_name" "text", "is_score" boolean, "live_only" boolean, "version_key" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_ranked_submissions"("game_name" "text", "category_name" "text", "is_score" boolean, "live_only" boolean, "version_key" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_ranked_submissions_json"("game_name" "text", "category_name" "text", "is_score" boolean, "live_only" boolean, "version_key" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_ranked_submissions_json"("game_name" "text", "category_name" "text", "is_score" boolean, "live_only" boolean, "version_key" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_ranked_submissions_json"("game_name" "text", "category_name" "text", "is_score" boolean, "live_only" boolean, "version_key" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_record_submissions"("game_name" "text", "category_name" "text", "is_score" boolean, "live_only" boolean, "version_key" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_record_submissions"("game_name" "text", "category_name" "text", "is_score" boolean, "live_only" boolean, "version_key" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_record_submissions"("game_name" "text", "category_name" "text", "is_score" boolean, "live_only" boolean, "version_key" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_record_submissions_json"("game_name" "text", "category_name" "text", "is_score" boolean, "live_only" boolean, "version_key" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."get_record_submissions_json"("game_name" "text", "category_name" "text", "is_score" boolean, "live_only" boolean, "version_key" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_record_submissions_json"("game_name" "text", "category_name" "text", "is_score" boolean, "live_only" boolean, "version_key" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_reported"("abb" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."get_reported"("abb" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_reported"("abb" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_timer_types"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_timer_types"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_timer_types"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_unapproved"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_unapproved"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_unapproved"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_unapproved"("abb" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."get_unapproved"("abb" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_unapproved"("abb" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_unapproved_counts"("abbs" "text"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."get_unapproved_counts"("abbs" "text"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_unapproved_counts"("abbs" "text"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."has_mod_note_changed"("submission_id" timestamp with time zone, "new_note" character varying) TO "anon";
GRANT ALL ON FUNCTION "public"."has_mod_note_changed"("submission_id" timestamp with time zone, "new_note" character varying) TO "authenticated";
GRANT ALL ON FUNCTION "public"."has_mod_note_changed"("submission_id" timestamp with time zone, "new_note" character varying) TO "service_role";



GRANT ALL ON FUNCTION "public"."insert_notify"() TO "anon";
GRANT ALL ON FUNCTION "public"."insert_notify"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."insert_notify"() TO "service_role";



GRANT ALL ON FUNCTION "public"."insert_notify_and_unapprove"() TO "anon";
GRANT ALL ON FUNCTION "public"."insert_notify_and_unapprove"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."insert_notify_and_unapprove"() TO "service_role";



GRANT ALL ON FUNCTION "public"."is_admin"() TO "anon";
GRANT ALL ON FUNCTION "public"."is_admin"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_admin"() TO "service_role";



GRANT ALL ON FUNCTION "public"."is_already_notified"("id" timestamp with time zone) TO "anon";
GRANT ALL ON FUNCTION "public"."is_already_notified"("id" timestamp with time zone) TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_already_notified"("id" timestamp with time zone) TO "service_role";



GRANT ALL ON FUNCTION "public"."is_moderator"("abb" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."is_moderator"("abb" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_moderator"("abb" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."is_only_version_changed"("submission_id" timestamp with time zone, "new_tas" boolean, "new_submitted_at" timestamp with time zone, "new_monkey_id" integer, "new_platform_id" integer, "new_region_id" integer, "new_proof" "text", "new_comment" "text", "new_live" boolean, "new_mod_note" "text", "new_version" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."is_only_version_changed"("submission_id" timestamp with time zone, "new_tas" boolean, "new_submitted_at" timestamp with time zone, "new_monkey_id" integer, "new_platform_id" integer, "new_region_id" integer, "new_proof" "text", "new_comment" "text", "new_live" boolean, "new_mod_note" "text", "new_version" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_only_version_changed"("submission_id" timestamp with time zone, "new_tas" boolean, "new_submitted_at" timestamp with time zone, "new_monkey_id" integer, "new_platform_id" integer, "new_region_id" integer, "new_proof" "text", "new_comment" "text", "new_live" boolean, "new_mod_note" "text", "new_version" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."is_url_safe"("input" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."is_url_safe"("input" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_url_safe"("input" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."prepare_submission_insert"() TO "anon";
GRANT ALL ON FUNCTION "public"."prepare_submission_insert"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."prepare_submission_insert"() TO "service_role";



GRANT ALL ON FUNCTION "public"."prepare_submission_update"() TO "anon";
GRANT ALL ON FUNCTION "public"."prepare_submission_update"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."prepare_submission_update"() TO "service_role";



GRANT ALL ON FUNCTION "public"."regulate_report_token"("report_token" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."regulate_report_token"("report_token" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."regulate_report_token"("report_token" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."report_exists"("s_id" timestamp with time zone) TO "anon";
GRANT ALL ON FUNCTION "public"."report_exists"("s_id" timestamp with time zone) TO "authenticated";
GRANT ALL ON FUNCTION "public"."report_exists"("s_id" timestamp with time zone) TO "service_role";



GRANT ALL ON FUNCTION "public"."submission_version_cascade"() TO "anon";
GRANT ALL ON FUNCTION "public"."submission_version_cascade"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."submission_version_cascade"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_notify_and_unapprove"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_notify_and_unapprove"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_notify_and_unapprove"() TO "service_role";



GRANT ALL ON FUNCTION "public"."valid_monkey_platform_region"("game_id" "text", "monkey_id" integer, "platform_id" integer, "region_id" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."valid_monkey_platform_region"("game_id" "text", "monkey_id" integer, "platform_id" integer, "region_id" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."valid_monkey_platform_region"("game_id" "text", "monkey_id" integer, "platform_id" integer, "region_id" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."validate_version_and_updatable_games"() TO "anon";
GRANT ALL ON FUNCTION "public"."validate_version_and_updatable_games"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."validate_version_and_updatable_games"() TO "service_role";



GRANT ALL ON FUNCTION "public"."validate_video_url"("url" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."validate_video_url"("url" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."validate_video_url"("url" "text") TO "service_role";

































GRANT ALL ON TABLE "public"."administrator" TO "anon";
GRANT ALL ON TABLE "public"."administrator" TO "authenticated";
GRANT ALL ON TABLE "public"."administrator" TO "service_role";



GRANT ALL ON TABLE "public"."approve" TO "anon";
GRANT ALL ON TABLE "public"."approve" TO "authenticated";
GRANT ALL ON TABLE "public"."approve" TO "service_role";



GRANT ALL ON TABLE "public"."category" TO "anon";
GRANT ALL ON TABLE "public"."category" TO "authenticated";
GRANT ALL ON TABLE "public"."category" TO "service_role";



GRANT ALL ON SEQUENCE "public"."category_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."category_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."category_id_seq" TO "service_role";



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



GRANT ALL ON TABLE "public"."game_profile" TO "anon";
GRANT ALL ON TABLE "public"."game_profile" TO "authenticated";
GRANT ALL ON TABLE "public"."game_profile" TO "service_role";



GRANT ALL ON TABLE "public"."game_region" TO "anon";
GRANT ALL ON TABLE "public"."game_region" TO "authenticated";
GRANT ALL ON TABLE "public"."game_region" TO "service_role";



GRANT ALL ON TABLE "public"."game_rule" TO "anon";
GRANT ALL ON TABLE "public"."game_rule" TO "authenticated";
GRANT ALL ON TABLE "public"."game_rule" TO "service_role";



GRANT ALL ON TABLE "public"."goal" TO "anon";
GRANT ALL ON TABLE "public"."goal" TO "authenticated";
GRANT ALL ON TABLE "public"."goal" TO "service_role";



GRANT ALL ON SEQUENCE "public"."goal_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."goal_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."goal_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."level" TO "anon";
GRANT ALL ON TABLE "public"."level" TO "authenticated";
GRANT ALL ON TABLE "public"."level" TO "service_role";



GRANT ALL ON TABLE "public"."mode" TO "anon";
GRANT ALL ON TABLE "public"."mode" TO "authenticated";
GRANT ALL ON TABLE "public"."mode" TO "service_role";



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



GRANT ALL ON SEQUENCE "public"."platform_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."platform_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."platform_id_seq" TO "service_role";



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



GRANT ALL ON SEQUENCE "public"."region_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."region_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."region_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."report" TO "anon";
GRANT ALL ON TABLE "public"."report" TO "authenticated";
GRANT ALL ON TABLE "public"."report" TO "service_role";



GRANT ALL ON TABLE "public"."rule" TO "anon";
GRANT ALL ON TABLE "public"."rule" TO "authenticated";
GRANT ALL ON TABLE "public"."rule" TO "service_role";



GRANT ALL ON SEQUENCE "public"."rule_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."rule_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."rule_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."version" TO "anon";
GRANT ALL ON TABLE "public"."version" TO "authenticated";
GRANT ALL ON TABLE "public"."version" TO "service_role";



GRANT ALL ON SEQUENCE "public"."version_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."version_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."version_id_seq" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";
































--
-- Dumped schema changes for auth and storage
--

CREATE POLICY "Admins can insert box art" ON "storage"."objects" FOR INSERT TO "authenticated" WITH CHECK ((("bucket_id" = 'games'::"text") AND "public"."is_admin"() AND ("storage"."extension"("name") = 'png'::"text")));



CREATE POLICY "Admins can update box art" ON "storage"."objects" FOR UPDATE TO "authenticated" USING ((("bucket_id" = 'games'::"text") AND "public"."is_admin"() AND ("storage"."extension"("name") = 'png'::"text"))) WITH CHECK ((("bucket_id" = 'games'::"text") AND "public"."is_admin"() AND ("storage"."extension"("name") = 'png'::"text")));



CREATE POLICY "Authenticated users can insert png w/profile ID 1oj01fe_0" ON "storage"."objects" FOR INSERT TO "authenticated" WITH CHECK ((("bucket_id" = 'avatars'::"text") AND ("storage"."filename"("name") = ("public"."get_profile_id"() || '.png'::"text")) AND ("storage"."extension"("name") = 'png'::"text")));



CREATE POLICY "Authenticated users can update png w/profile ID 1oj01fe_0" ON "storage"."objects" FOR UPDATE TO "authenticated" USING ((("bucket_id" = 'avatars'::"text") AND ("storage"."filename"("name") = ("public"."get_profile_id"() || '.png'::"text")) AND ("storage"."extension"("name") = 'png'::"text"))) WITH CHECK ((("bucket_id" = 'avatars'::"text") AND ("storage"."filename"("name") = ("public"."get_profile_id"() || '.png'::"text")) AND ("storage"."extension"("name") = 'png'::"text")));



CREATE POLICY "Avatars are publicly accessible 1oj01fe_0" ON "storage"."objects" FOR SELECT USING (("bucket_id" = 'avatars'::"text"));



CREATE POLICY "Box art is publicly avaliable 1mf269_0" ON "storage"."objects" FOR SELECT USING (("bucket_id" = 'games'::"text"));






SELECT cron.schedule(
    'Reset report tokens',
    '0 0 * * *',
    $$    
        UPDATE profile
        SET report_token = 10
    $$
);