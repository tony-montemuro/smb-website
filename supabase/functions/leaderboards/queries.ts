/* ===== IMPORTS ===== */
import type {
  Client,
  LeaderboardParams,
  Mode,
  RankedSubmission,
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

// FUNCTION 2: getRankedSubmissions - function that grabs the best submission of each profile, for each level of a game
// PRECONDITIONS (2 parameters):
// 1.) client: the supabase client which the query runs through
// 2.) params: the parameters of the leaderboard
// POSTCONDITIONS (2 possible outcomes):
// if the query is successful, the array of submissions is returned, ordered by level, then by record in descending order, then by
// submitted_at in ascending order
// otherwise, this function throws an error, which should be handled by the caller function
export const getRankedSubmissions = async (
  client: Client,
  params: LeaderboardParams,
): Promise<RankedSubmission[]> => {
  const { data: submissions, error } = await client.rpc(
    "get_ranked_submissions_json",
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

// FUNCTION 3: getCategoryTime - function that grabs the sum of the time limits of every timed level of a category
// PRECONDITIONS (2 parameters):
// 1.) client: the supabase client which the query runs through
// 2.) params: the parameters of the leaderboard
// POSTCONDITIONS (2 possible outcomes):
// if the query is successful, the total time is returned
// otherwise, this function throws an error, which should be handled by the caller function
export const getCategoryTime = async (
  client: Client,
  params: LeaderboardParams,
): Promise<number> => {
  const { data: categoryTime, error } = await client.rpc("get_category_time", {
    game_name: params.abb,
    category_name: params.category,
  });

  // error handling
  if (error) {
    throw error;
  }

  return categoryTime;
};

// FUNCTION 4: getPracticeCategories - function that grabs the abb of every practice mode category
// PRECONDITIONS (1 parameter):
// 1.) client: the supabase client which the query runs through
// POSTCONDITIONS (2 possible outcomes):
// if the query is successful, the array of category abbs is returned
// otherwise, this function throws an error, which should be handled by the caller function
export const getPracticeCategories = async (
  client: Client,
): Promise<string[]> => {
  const { data: categories, error } = await client
    .from("category")
    .select("abb")
    .eq("practice", true);

  // error handling
  if (error) {
    throw error;
  }

  return categories.map((category) => category.abb);
};

// FUNCTION 5: getCategoryLevelsByMode - function that grabs the levels of a category, grouped by mode
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
