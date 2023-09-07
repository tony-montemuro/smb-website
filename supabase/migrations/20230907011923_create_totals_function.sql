CREATE OR REPLACE FUNCTION get_totals( abb text, category category_t, score boolean, live_only boolean )
RETURNS json
LANGUAGE plv8
AS $$
  // -- first, this code should only really execute for "practice mode" categories, a.k.a., when the `category` param is "main" or "misc". return an empty array otherwise
  if (category !== "main" && category !== "misc") {
    return [];
  }

  // -- next, get the ranked submissions according to the function parameters
  let query = 'SELECT * FROM get_ranked_submissions($1, $2, $3, $4)';
  let paramTypes = ['text', 'category_t', 'boolean', 'boolean'];
  let plan = plv8.prepare(query, paramTypes);
  const submissions = plan.execute( [abb, category, score, live_only] );
  plan.free();

  // -- next, get the total time. note: this is only necessary to define if `score` is FALSE
  let totalTime;
  if (!score) {
    query = 'SELECT get_category_time($1, $2)';
    paramTypes = ['text', 'category_t'];
    plan = plv8.prepare(query, paramTypes);
    result = plan.execute( [abb, category] );
    totalTime = result[0].get_category_time;
    plan.free();
  }

  // -- next, we want to create our mapping of users to totals
  const userToTotal = {};
  submissions.forEach(submission => {

    // -- first, extract information from submission object
    const profile = { 
      id: submission.id,
      username: submission.username,
      country: submission.country
    };
    const record = score ? submission.record : -Math.abs(submission.record);

    // -- then, we can update the mapping object
    // -- default case: user has already been added to mapping. simple increment the total field
    if (profile.id in userToTotal) {
      userToTotal[profile.id].total += record
    } 
    
    // -- edge case: user has not yet been added to the mapping. add them, as well as the record (or sum of `totalTime` and `record`) as total
    else {
      userToTotal[profile.id] = { profile: profile, total: score ? record : totalTime + record };
    }

  });

  // -- now, let's convert our mapping into an array of objects, sorted by `total`. NOTE: order of sort depends on the `score` parameter
  let totals;
  if (score) {
    totals = Object.values(userToTotal).sort((a, b) => a.total > b.total ? -1 : 1);
  } else {
    totals = Object.values(userToTotal).sort((a, b) => a.total > b.total ? 1 : -1);
  }

  // -- now, let's add the position attribute
  let trueCount = 1, posCount = trueCount;
  totals.forEach((row, index) => {
    row.position = posCount;
    trueCount++;
    
    // -- if next element exists, and has a different total than the current total, update posCount
    if (index < totals.length-1 && totals[index+1].total !== row.total) {
      posCount = trueCount;
    }
  });

  // -- finally, return our totals array of objects
  return totals;
$$;