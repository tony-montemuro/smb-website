CREATE OR REPLACE FUNCTION "public"."update_notify_and_unapprove"() RETURNS "trigger"
  LANGUAGE "plpgsql"
  AS $$
DECLARE
  changed_columns text[];
  current_id int4;
  user_id_for_notif uuid;
BEGIN
  -- First, let's determine which columns have changed
  SELECT array_agg(o.key)
  INTO changed_columns
  FROM jsonb_each(to_jsonb(OLD)) AS o
  CROSS JOIN jsonb_each(to_jsonb(NEW)) AS n
  WHERE o.key = n.key AND o.value IS DISTINCT FROM n.value;

  -- If only `level_id` has changed, let's exit trigger early
  IF changed_columns = ARRAY['level_id'] THEN
    return NEW;
  END IF;

  -- next, let's verify that the submission's profile is authenticated
  SELECT user_id into user_id_for_notif
  FROM profile
  WHERE id = NEW.profile_id;

  -- now, get the profile id of the user performing the UPDATE
  current_id := get_profile_id();

  -- if the submission being updated belongs to an authenticated user, AND the profile_id is not the same as the current_id, we need to send an UPDATE notification
  IF user_id_for_notif IS NOT NULL AND NEW.profile_id <> current_id then
    INSERT INTO notification (submission_id, game_id, level_id, category, score, tas, record, profile_id, creator_id, notif_type, submitted_at, region_id, monkey_id, platform_id, proof, live, comment, mod_note)
    VALUES (NEW.id, NEW.game_id, NEW.level_id, NEW.category, NEW.score, OLD.tas, NEW.record, NEW.profile_id, current_id, 'update', OLD.submitted_at, OLD.region_id, OLD.monkey_id, OLD.platform_id, OLD.proof, OLD.live, OLD.comment, OLD.mod_note);
  END IF;
  
  -- next, let's delete any approval of the submission, if there is one
  DELETE from approve
  WHERE submission_id = NEW.id;

  RETURN NEW;
END;
$$;