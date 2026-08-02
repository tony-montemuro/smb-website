-- Drop the plv8 procedures which the leaderboards edge function now replaces, then the extension itself. `pgjwt` goes with it: it
-- was installed when the project was created, and nothing has ever called `sign`, `verify`, or `url_encode`. Neither extension is
-- available on PostgreSQL 17, so removing both unblocks the database upgrade.

-- The drops are conditional because the statements that created these RPCs are commented out on PostgreSQL 17, where `plv8` is
-- unavailable. They still exist on any database that was created before the upgrade, including production.

DROP FUNCTION IF EXISTS get_records(text, text, boolean, boolean, int);
DROP FUNCTION IF EXISTS get_totals(text, text, boolean, boolean, int);
DROP FUNCTION IF EXISTS get_user_rankings(text, text, boolean, boolean, int, int);

DROP EXTENSION IF EXISTS plv8;
DROP EXTENSION IF EXISTS pgjwt;
