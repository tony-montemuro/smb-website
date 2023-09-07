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
      while (index < submissions.length && submissions[index].level_id === level) {

        // -- if current submission has id of `profile_id`, it is the user's submission. thus, we need to update record object
        const submission = submissions[index];
        if (submission.id === profile_id) {
          recordObj.record = submission.record;
          recordObj.date = submission.date;
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