CREATE OR REPLACE FUNCTION validate_version_and_updatable_games()
RETURNS "trigger"
LANGUAGE "plpgsql" AS $$
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

CREATE OR REPLACE FUNCTION update_notify_and_unapprove() RETURNS "trigger"
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