-- The public roadmap, mirrored out of linear by the `roadmap` edge function. The primary key is the id linear gives the issue,
-- rather than a surrogate: it is the natural key, it is what a webhook delivery arrives carrying, and it is the conflict target
-- of the upsert below.
CREATE TABLE roadmap_issue (
  linear_id uuid PRIMARY KEY,
  identifier varchar(20) NOT NULL,
  title varchar(255) NOT NULL,
  -- Both the name of the status and its type: status names are configured per team, while the six types are not, so a reader
  -- groups on the type and displays the name. There is deliberately no check constraint on the type, since a vocabulary linear
  -- owns can grow, and a rejected write would lose the issue rather than merely render it in an unexpected bucket.
  state_name varchar(255) NOT NULL,
  state_type varchar(20) NOT NULL,
  project_name varchar(255),
  created_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL,
  completed_at timestamptz
);

-- Reads are public, and the only writer is the service role, which bypasses this entirely. There are deliberately no insert,
-- update, or delete policies: nothing but the ingest should ever write here.
ALTER TABLE roadmap_issue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON roadmap_issue FOR SELECT USING (true);

-- Writes the issue a delivery carries, guarding against a delivery which arrives out of order. Linear retries a failed delivery
-- at one minute, one hour, and six hours, so a payload can arrive carrying an issue as it was before two newer changes landed;
-- the `WHERE` turns that stale write into a no-op rather than a regression.
-- NOTE: every parameter is prefixed, since an unprefixed name collides with the column of the same name inside `ON CONFLICT`.
CREATE OR REPLACE FUNCTION sync_roadmap_issue(
  p_linear_id uuid,
  p_identifier varchar,
  p_title varchar,
  p_state_name varchar,
  p_state_type varchar,
  p_project_name varchar,
  p_created_at timestamptz,
  p_updated_at timestamptz,
  p_completed_at timestamptz
)
RETURNS void
LANGUAGE sql
AS $$
INSERT INTO roadmap_issue (
  linear_id, identifier, title, state_name, state_type, project_name, created_at, updated_at, completed_at
)
VALUES (
  p_linear_id, p_identifier, p_title, p_state_name, p_state_type, p_project_name, p_created_at, p_updated_at, p_completed_at
)
ON CONFLICT (linear_id) DO UPDATE
SET
  identifier = excluded.identifier,
  title = excluded.title,
  state_name = excluded.state_name,
  state_type = excluded.state_type,
  project_name = excluded.project_name,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  completed_at = excluded.completed_at
WHERE excluded.updated_at > roadmap_issue.updated_at;
$$;

-- Drops an issue which stopped being public, and the guard matters for a sharper reason than the one above: a replayed
-- "label removed" delivery would otherwise delete the row of an issue which has since been made public again. A delivery which
-- carries no usable timestamp deletes unguarded, since a delete you cannot date is safer applied than dropped.
CREATE OR REPLACE FUNCTION remove_roadmap_issue(p_linear_id uuid, p_updated_at timestamptz)
RETURNS void
LANGUAGE sql
AS $$
DELETE FROM roadmap_issue
WHERE linear_id = p_linear_id
AND (p_updated_at IS NULL OR updated_at <= p_updated_at);
$$;

-- The baseline grants execute on every new function to `anon` through `ALTER DEFAULT PRIVILEGES`, so both procedures above are
-- callable by anyone through PostgREST the moment they exist. Neither would actually write: both are SECURITY INVOKER, so their
-- bodies run as the caller, and no policy lets `anon` insert or delete. Revoking access is what moves that guarantee off the
-- absence of a write policy, so that adding one later, or marking either procedure SECURITY DEFINER, cannot quietly turn it into
-- a public write endpoint. `service_role` is the Postgres role a secret key resolves to, and is unrelated to the legacy key of
-- the same name.
REVOKE ALL ON FUNCTION sync_roadmap_issue(uuid, varchar, varchar, varchar, varchar, varchar, timestamptz, timestamptz, timestamptz)
FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION remove_roadmap_issue(uuid, timestamptz) FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION sync_roadmap_issue(uuid, varchar, varchar, varchar, varchar, varchar, timestamptz, timestamptz, timestamptz)
TO service_role;
GRANT EXECUTE ON FUNCTION remove_roadmap_issue(uuid, timestamptz) TO service_role;
