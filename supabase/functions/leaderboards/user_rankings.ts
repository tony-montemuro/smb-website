/* ===== IMPORTS ===== */
import type {
  Mode,
  RankedSubmission,
  UserRankingEntry,
  UserRankings,
} from "./types.ts";

/* ===== FUNCTIONS ===== */

// FUNCTION 1: buildUserRankings - function that generates the rankings of a single profile from the ranked submissions of a game
// PRECONDITIONS (3 parameters):
// 1.) submissions: the array of ranked submissions, ordered by level, exactly as `get_ranked_submissions_json` returns them. the
// levels of every mode share a single cursor, so this order is what assigns each submission to its level
// 2.) modes: the array of modes of the game, and the levels of each mode
// 3.) profileId: the id of the profile whose rankings are wanted
// POSTCONDITIONS (1 possible outcome):
// an object is returned, which maps the name of each mode to the array of rankings for the levels of that mode
export const buildUserRankings = (
  submissions: RankedSubmission[],
  modes: Mode[],
  profileId: number,
): UserRankings => {
  // initialize variables used to generate the rankings
  const rankings: UserRankings = {};
  let index = 0;

  // now, let's populate the rankings object
  modes.forEach((mode) => {
    const modeRecords: UserRankingEntry[] = []; // store the array of record objects for each level in the mode
    mode.levels.forEach((level) => {
      // create default record object
      const recordObj: UserRankingEntry = {
        level: level,
        record: null,
        date: null,
        position: null,
      };

      // loop through all submissions for the current level
      while (
        index < submissions.length &&
        submissions[index].level_id === level.name
      ) {
        // if current submission has id of `profileId`, it is the user's submission. thus, we need to update record object
        const submission = submissions[index];
        if (submission.id === profileId) {
          recordObj.record = submission.record;
          recordObj.date = new Date(submission.submitted_at).toISOString();
          recordObj.position = submission.position;
        }
        index++;
      }
      modeRecords.push(recordObj);
    });

    // once we have gone through each level in the current mode, update the rankings object
    rankings[mode.name] = modeRecords;
  });

  // every submission belongs to a level of some mode, so a leftover means the submissions did not arrive in the order the cursor
  // walks them in. failing loudly is deliberate: the alternative is a set of rankings which silently omits levels
  if (index !== submissions.length) {
    throw new Error(
      `${
        submissions.length - index
      } ranked submissions were not assigned to a level`,
    );
  }

  // finally, return rankings
  return rankings;
};
