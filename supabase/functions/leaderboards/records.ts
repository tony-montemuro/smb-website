/* ===== IMPORTS ===== */
import type {
  Mode,
  RecordEntry,
  RecordProfile,
  RecordSubmission,
  RecordTable,
} from "./types.ts";

/* ===== FUNCTIONS ===== */

// FUNCTION 1: buildRecordTable - function that generates the record table of a game from its record submissions
// PRECONDITIONS (2 parameters):
// 1.) submissions: the array of record submissions, ordered by level, exactly as `get_record_submissions_json` returns them. the
// levels of every mode share a single cursor, so this order is what assigns each submission to its level
// 2.) modes: the array of modes of the game, and the levels of each mode
// POSTCONDITIONS (1 possible outcome):
// an object is returned, which maps the name of each mode to the array of records for the levels of that mode
export const buildRecordTable = (
  submissions: RecordSubmission[],
  modes: Mode[],
): RecordTable => {
  // initialize variables used to generate record table
  const recordTable: RecordTable = {};
  let index = 0;

  // now, let's populate the record table
  modes.forEach((mode) => {
    const modeRecords: RecordEntry[] = []; // store the array of record objects for each level in the mode
    mode.levels.forEach((level) => {
      // create default record object
      const recordObj: RecordEntry = {
        level: level,
        profiles: [],
        record: null,
      };

      // loop through all submissions for the current level
      while (
        index < submissions.length &&
        submissions[index].level_id === level.name
      ) {
        const submission = submissions[index];
        const profile: RecordProfile = {
          country: submission.country,
          id: submission.profile_id,
          username: submission.username,
          submission_id: new Date(submission.id).toISOString(),
        };
        recordObj.record = submission.record;

        if (!recordObj.profiles.some((p) => p.id === profile.id)) {
          recordObj.profiles.push(profile);
        }
        index++;
      }
      modeRecords.push(recordObj);
    });

    // once we have gone through each level in the current mode, update the record table
    recordTable[mode.name] = modeRecords;
  });

  // finally, return record table
  return recordTable;
};
