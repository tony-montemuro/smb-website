CREATE OR REPLACE FUNCTION get_category_levels_by_mode(game_name text, category_name category_t, is_score boolean)
RETURNS TABLE (name text)
LANGUAGE sql
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

CREATE OR REPLACE FUNCTION get_records( abb text, category category_t, score boolean, live_only boolean )
RETURNS json
LANGUAGE plv8
AS $$
  // -- first, get the ranked submissions according to the function parameters
  let query = 'SELECT * FROM get_ranked_submissions($1, $2, $3, $4)';
  let paramTypes = ['text', 'category_t', 'boolean', 'boolean'];
  let plan = plv8.prepare(query, paramTypes);
  const submissions = plan.execute( [abb, category, score, live_only] );
  plan.free();

  // -- next, get the list of modes for the (abb, category, score) combination
  query = 'SELECT get_category_levels_by_mode($1, $2, $3)';
  paramTypes = ['text', 'category_t', 'boolean'];
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

        // -- if current submission has position of 1, it is record. thus, we need to update record object
        const submission = submissions[index];
        if (submission.position === 1) {
          const profile = { country: submission.country, id: submission.id, username: submission.username };
          recordObj.record = submission.record;
          recordObj.profiles.push(profile);
        }
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

CREATE OR REPLACE FUNCTION get_user_rankings( abb text, category category_t, score boolean, live_only boolean, profile_id integer )
RETURNS json
LANGUAGE plv8
AS $$
  // -- first, get the ranked submissions according to the function parameters
  let query = 'SELECT * FROM get_ranked_submissions($1, $2, $3, $4)';
  let paramTypes = ['text', 'category_t', 'boolean', 'boolean'];
  let plan = plv8.prepare(query, paramTypes);
  const submissions = plan.execute( [abb, category, score, live_only] );
  plan.free();

  // -- next, get the list of modes for the abb, category, score combination
  query = 'SELECT get_category_levels_by_mode($1, $2, $3)';
  paramTypes = ['text', 'category_t', 'boolean'];
  plan = plv8.prepare(query, paramTypes);
  const result = plan.execute( [abb, category, score] );
  const modes = JSON.parse(result[0].get_category_levels_by_mode);
  plan.free();

  // -- initialize variables used to generate the rankings
  const rankings = {};
  let index = 0;

  // -- now, let's populate the rankings object
  modes.forEach(mode => {
    const modeRecords = []; // -- store the array of record objects for each level in the mode
    mode.levels.forEach(level => {

      // -- create default record object
      const recordObj = {
        level: level,
        record: null,
        date: null,
        position: null
      };

      // -- loop through all submissions for the current level
      while (index < submissions.length && submissions[index].level_id === level.name) {

        // -- if current submission has id of `profile_id`, it is the user's submission. thus, we need to update record object
        const submission = submissions[index];
        if (submission.id === profile_id) {
          recordObj.record = submission.record;
          recordObj.date = submission.submitted_at;
          recordObj.position = submission.position;
        }
        index++;
      }
      modeRecords.push(recordObj);
    });
    
    // -- once we have gone through each level in the current mode, update the rankings object
    rankings[mode.name] = modeRecords;
  });

  // -- finally, return rankings
  return rankings;
$$;