/* ===== IMPORTS ===== */
import { supabase } from "../SupabaseClient";

const RPCRead = () => {
  /* ===== FUNCTIONS ===== */

  // FUNCTION 1: getMedals - function that calls on a procedure to generate a medals array depending on the parameters
  // PRECONDITIONS (4 parameters):
  // 1.) abb: a string representing the unique identifier for a game
  // 2.) category: a string representing a valid category
  // 3.) type: a string, either "score" or "time"
  // 4.) version: an int OR undefined: an int if game has versions, otherwise undefined
  // POSTCONDITIONS (2 possible outcomes):
  // if the query is successful, an array of medals objects, sorted by position field, is returned
  // otherwise, this function throws an error, which should be handled by the caller function
  const getMedals = async (abb, category, type, version) => {
    const { data: medals, error } = await supabase.rpc("get_medals", {
      abb,
      category,
      score: type === "score",
      version: version ?? null,
    });

    // error handling
    if (error) {
      throw error;
    }

    return medals;
  };

  // FUNCTION 2: getChartSubmissions - function that calls on a procedure to generate the list of submissions for a particular chart
  // PRECONDITIONS (5 parameters):
  // 1.) abb: a string representing the unique identifier for a game
  // 2.) category: a string representing a valid category
  // 3.) level: a string representing the name of the level whose chart data we need to query
  // 4.) type: a string, either "score" or "time"
  // 5.) version: an int OR undefined: an int if game has versions, otherwise undefined
  // POSTCONDITIONS (2 possible outcomes):
  // if the query is successful, an array of submissions, ordered by record in descending order, then by submitted_at in ascending
  // order, is returned
  // otherwise, this function throws an error, which should be handled by the caller function
  const getChartSubmissions = async (abb, category, level, type, version) => {
    const { data: submissions, error } = await supabase.rpc(
      "get_chart_submissions",
      {
        game: abb,
        category_name: category,
        level,
        is_score: type === "score",
        version_key: version ?? null,
      },
    );

    // error handling
    if (error) {
      throw error;
    }

    return submissions;
  };

  // FUNCTION 3: getUnapprovedCounts - function that grabs the count of unapproved submissions, either for a list of games, or all
  // games
  // PRECONDITIONS (1 parameter):
  // 1.) games: an array of game strings (abbs), which is set if the current user is a moderator. otherwise, an empty array is supplied,
  // which should return the result for ALL games
  // POSTCONDITIONS (2 possible outcomes):
  // if the query is successful, an array of objects, one for each game, is returned, which specifies the count of unapproved
  // submissions per game
  // if the query is unsuccessful, an error is thrown, which is to be handled by the caller function
  const getUnapprovedCounts = async (games) => {
    const { data: gameCounts, error } = await supabase.rpc(
      "get_unapproved_counts",
      { abbs: games },
    );

    // error handling
    if (error) {
      throw error;
    }

    return gameCounts;
  };

  // FUNCTION 4: getUnapprovedByGame - function that grabs all the unapproved submissions for a particular game
  // PRECONDITIONS (1 parameter):
  // 1.) abb: a string corresponding to the primary key of a game
  // POSTCONDITIONS (2 possible outcomes):
  // if the query is successful, an array of submissions is simply returned, sorted by the submission id in descending order
  // if the query is not successful, an error is thrown, which is expected to be handled by the caller function
  const getUnapprovedByGame = async (abb) => {
    const { data: submissions, error } = await supabase.rpc("get_unapproved", {
      abb: abb,
    });

    // error handling
    if (error) {
      throw error;
    }

    return submissions;
  };

  // FUNCTION 5: getReportedByGame - function that grabs all the reported submissions for a particular game
  // PRECONDITIONS (1 parameter):
  // 1.) abb: a string corresponding to the primary key of a game
  // POSTCONDITIONS (2 possible outcomes):
  // if the query is successful, an array of submissions is simply returned, sorted by the submission id in descending order
  // if the query is not successful, an error is thrown, which is expected to be handled by the caller function
  const getReportedByGame = async (abb) => {
    const { data: submissions, error } = await supabase.rpc("get_reported", {
      abb: abb,
    });

    // error handling
    if (error) {
      throw error;
    }

    return submissions;
  };

  // FUNCTION 6: getProfile - function that can grab a single profile using a profile id
  // PRECONDITIONS (1 parameter):
  // 1.) profileId: an integer corresponding to the primary key of a profile in the database
  // POSTCONDITIONS (2 possible outcomes):
  // if the query is successful, a profile object is simply returned
  // if the query is unsuccessful, this function will throw an error, which should be handled by the caller function
  const getProfile = async (profileId) => {
    const { data: profile, error } = await supabase.rpc("get_profile", {
      p_id: profileId,
    });

    // error handling
    if (error) {
      throw error;
    }

    return profile;
  };

  // FUNCTION 7: getChartTypes - function that grabs all chart types from the database
  // PRECONDITIONS: NONE
  // POSTCONDITIONS (2 possible outcomes):
  // if the query is successful, the array of chart types is returned
  // if the query is unsuccessful, this function will throw an error, which should be handled by the caller function
  const getChartTypes = async () => {
    const { data: chartTypes, error } = await supabase.rpc("get_chart_types");

    // error handling
    if (error) {
      throw error;
    }

    return chartTypes;
  };

  // FUNCTION 8: getTimerTypes - funcion that grabs all timer types from the database
  // PRECONDITIONS: NONE
  // POSTCONDITIONS (2 possible outcomes):
  // if the query is successful, the array of timer types is returned
  // if the query is unsuccessful, this function will throw an error, which should be handled by the caller function
  const getTimerTypes = async () => {
    const { data: timerTypes, error } = await supabase.rpc("get_timer_types");

    // error handling
    if (error) {
      throw error;
    }

    return timerTypes;
  };

  return {
    getMedals,
    getChartSubmissions,
    getUnapprovedCounts,
    getUnapprovedByGame,
    getReportedByGame,
    getProfile,
    getChartTypes,
    getTimerTypes,
  };
};

/* ===== EXPORTS ===== */
export default RPCRead;
