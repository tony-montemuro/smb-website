/* ===== IMPORTS ===== */
import type { RankedSubmission, Total, TotalProfile } from "./types.ts";

/* ===== FUNCTIONS ===== */

// FUNCTION 1: buildTotals - function that generates the totalizer of a game from its ranked submissions
// PRECONDITIONS (3 parameters):
// 1.) submissions: the array of ranked submissions, exactly as `get_ranked_submissions_json` returns them
// 2.) score: a boolean value representing whether the totalizer sums scores, or times
// 3.) totalTime: the sum of the time limits of every level of the category. only a time totalizer uses it, since a time total
// counts the time remaining, rather than the time spent
// POSTCONDITIONS (1 possible outcome):
// an array of totals is returned, sorted by total, best first, with the position of each total assigned
export const buildTotals = (
  submissions: RankedSubmission[],
  score: boolean,
  totalTime: number,
): Total[] => {
  // first, we want to create our mapping of users to totals. NOTE: the keys are profile ids, so the mapping iterates in ascending
  // id order. neither comparator below returns 0 for a tie, so that order survives in a score totalizer, and reverses in a time
  // totalizer. both are ported as they were, since the order two tied profiles appear in is what the leaderboards already show
  const userToTotal: Record<number, Total> = {};
  submissions.forEach((submission) => {
    // first, extract information from submission object
    const profile: TotalProfile = {
      id: submission.id,
      username: submission.username,
      country: submission.country,
    };
    const record = score ? submission.record : -Math.abs(submission.record);

    // then, we can update the mapping object
    // default case: user has already been added to mapping. simply increment the total field
    if (profile.id in userToTotal) {
      userToTotal[profile.id].total += record;
    } // edge case: user has not yet been added to the mapping. add them, as well as the record (or sum of `totalTime` and
    // `record`) as total. NOTE: position is a placeholder, which the walk below assigns once the totals are sorted
    else {
      userToTotal[profile.id] = {
        profile: profile,
        total: score ? record : totalTime + record,
        position: 0,
      };
    }
  });

  // now, let's convert our mapping into an array of objects, sorted by `total`. NOTE: order of sort depends on the `score`
  // parameter
  let totals: Total[];
  if (score) {
    totals = Object.values(userToTotal).sort((a, b) =>
      a.total > b.total ? -1 : 1
    );
  } else {
    totals = Object.values(userToTotal).sort((a, b) =>
      a.total > b.total ? 1 : -1
    );
  }

  // now, let's add the position attribute
  let trueCount = 1, posCount = trueCount;
  totals.forEach((row, index) => {
    row.position = posCount;
    trueCount++;

    // if next element exists, and has a different total than the current total, update posCount
    if (index < totals.length - 1 && totals[index + 1].total !== row.total) {
      posCount = trueCount;
    }
  });

  // finally, return our totals array of objects
  return totals;
};
