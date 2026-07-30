/* ===== IMPORTS ===== */
import type {
  Client,
  LeaderboardParams,
  Mode,
  RecordSubmission,
} from "./types.ts";

/* ===== FUNCTIONS ===== */

// FUNCTION 1: getRecordSubmissions - function that grabs the world record submissions of a game
// PRECONDITIONS (2 parameters):
// 1.) client: the supabase client which the query runs through
// 2.) params: the parameters of the leaderboard
// POSTCONDITIONS (2 possible outcomes):
// if the query is successful, the array of submissions is returned, ordered by level, then by record in descending order, then by
// submitted_at in ascending order
// otherwise, this function throws an error, which should be handled by the caller function
export const getRecordSubmissions = async (
  client: Client,
  params: LeaderboardParams,
): Promise<RecordSubmission[]> => {
  const { data: submissions, error } = await client.rpc(
    "get_record_submissions_json",
    {
      game_name: params.abb,
      category_name: params.category,
      is_score: params.score,
      live_only: params.liveOnly,
      version_key: params.version,
    },
  );

  // error handling
  if (error) {
    throw error;
  }

  return submissions;
};

// FUNCTION 2: getCategoryLevelsByMode - function that grabs the levels of a category, grouped by mode
// PRECONDITIONS (2 parameters):
// 1.) client: the supabase client which the query runs through
// 2.) params: the parameters of the leaderboard
// POSTCONDITIONS (2 possible outcomes):
// if the query is successful, the array of modes is returned, each ordered as the game presents them
// otherwise, this function throws an error, which should be handled by the caller function
export const getCategoryLevelsByMode = async (
  client: Client,
  params: LeaderboardParams,
): Promise<Mode[]> => {
  const { data: modes, error } = await client.rpc(
    "get_category_levels_by_mode",
    {
      game_name: params.abb,
      category_name: params.category,
      is_score: params.score,
    },
  );

  // error handling
  if (error) {
    throw error;
  }

  // the procedure is declared as returning a table of text, so the modes arrive as a json string in the only row
  return JSON.parse(modes[0].name);
};
