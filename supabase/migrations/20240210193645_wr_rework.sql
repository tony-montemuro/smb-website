CREATE OR REPLACE FUNCTION get_record_submissions(game_name text, category_name text, is_score boolean, live_only boolean)
RETURNS TABLE (
  game_id text,
  level_id text,
  category text,
  id integer,
  username varchar(25),
  country text,
  record float8,
  submitted_at timestamptz,
  live boolean
)
LANGUAGE sql
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
      RANK() OVER (
        PARTITION BY (s.game_id, s.category, s.level_id, s.score, CASE WHEN live_only THEN s.live ELSE NULL END) 
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
  )
  SELECT r.game_id, r.level_id, r.category, r.id, r.username, r.country, r.record, r.submitted_at, r.live
  FROM ranked r
  WHERE r.rn = 1
  ORDER BY r.level_ctr ASC, r.record DESC, r.submitted_at ASC
$$;

CREATE OR REPLACE FUNCTION get_records(abb text, category text, score boolean, live_only boolean)
RETURNS json
LANGUAGE plv8
AS $$
  // -- first, get the record submissions according to the function parameters
  let query = 'SELECT * FROM get_record_submissions($1, $2, $3, $4)';
  let paramTypes = ['text', 'text', 'boolean', 'boolean'];
  let plan = plv8.prepare(query, paramTypes);
  const submissions = plan.execute( [abb, category, score, live_only] );
  plan.free();

  // -- next, get the list of modes for the (abb, category, score) combination
  query = 'SELECT get_category_levels_by_mode($1, $2, $3)';
  paramTypes = ['text', 'text', 'boolean'];
  plan = plv8.prepare(query, paramTypes);
  const result = plan.execute( [abb, category, score] );
  const modes = JSON.parse(result[0].get_category_levels_by_mode);
  plan.free();

  // -- initialize variables used to generate record table
  const recordTable = {};
  let index = 0;

  // -- now, let's populate the record table
  modes.forEach(mode => {
    const modeRecords = []; // -- store the array of record objects for each level in the mode
    mode.levels.forEach(level => {

      // -- create default record object
      const recordObj = {
        level: level,
        profiles: [],
        record: null
      };

      // -- loop through all submissions for the current level
      while (index < submissions.length && submissions[index].level_id === level.name) {
        const submission = submissions[index];
        const profile = { country: submission.country, id: submission.id, username: submission.username };
        recordObj.record = submission.record;
        recordObj.profiles.push(profile);
        index++;
      }
      modeRecords.push(recordObj);
    });
    
    // -- once we have gone through each level in the current mode, update the record table
    recordTable[mode.name] = modeRecords;
  });

  // -- finally, return record table
  return recordTable;
$$;