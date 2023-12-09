/* ===== IMPORTS ===== */
import { supabase } from "../SupabaseClient";

const RPCRead = () => {
    /* ===== FUNCTIONS ===== */
    
    // FUNCTION 1: getRecords - function that calls on a procedure to generate the world records depending on the parameters
    // PRECONDITIONS (4 parameters):
    // 1.) abb: a string representing the unique identifier for a game
    // 2.) category: a string representing a valid category
    // 3.) type: a string, either "score" or "time"
    // 4.) live: a boolean value representing whether or not to filter by live submissions
    // POSTCONDITIONS (2 possible outcomes):
    // if the query is successful, the array of modes containing the record objects is simply returned
    // otherwise, this function throws an error, which should be handled by the caller function
    const getRecords = async (abb, category, type, live) => {
        try {
            const { data: records, error } = await supabase.rpc("get_records", { 
                abb: abb, 
                category: category,
                score: type === "score",
                live_only: live
            });

            // error handling
            if (error) {
                throw error;
            }

            return records;

        } catch (error) {
            // if we get an error, throw for caller function to handle
            throw error;
        };
    };

    // FUNCTION 2: getTotals - function that calls on a procedure to generate a totalizer array depending on the parameters
    // PRECONDITIONS (4 parameters):
    // 1.) abb: a string representing the unique identifier for a game
    // 2.) category: a string representing a valid category
    // 3.) type: a string, either "score" or "time"
    // 4.) live: a boolean value representing whether or not to filter by live submissions
    // POSTCONDITIONS (2 possible outcomes):
    // if the query is successful, an array of totals objects, sorted by position field, is returned
    // otherwise, this function throws an error, which should be handled by the caller function
    const getTotals = async (abb, category, type, live) => {
        try {
            const { data: totals, error } = await supabase.rpc("get_totals", { 
                abb: abb, 
                category: category,
                score: type === "score",
                live_only: live
            });

            // error handling
            if (error) {
                throw error;
            }

            return totals;

        } catch (error) {
            // if we get an error, throw for caller function to handle
            throw error;
        };
    };

    // FUNCTION 3: getMedals - function that calls on a procedure to generate a medals array depending on the parameters
    // PRECONDITIONS (3 parameters):
    // 1.) abb: a string representing the unique identifier for a game
    // 2.) category: a string representing a valid category
    // 3.) type: a string, either "score" or "time"
    // POSTCONDITIONS (2 possible outcomes):
    // if the query is successful, an array of medals objects, sorted by position field, is returned
    // otherwise, this function throws an error, which should be handled by the caller function
    const getMedals = async (abb, category, type) => {
        try {
            const { data: medals, error } = await supabase.rpc("get_medals", { 
                abb: abb, 
                category: category,
                score: type === "score"
            });

            // error handling
            if (error) {
                throw error;
            }

            return medals;

        } catch (error) {
            // if we get an error, throw for caller function to handle
            throw error;
        };
    };

    // FUNCTION 4: getUserRankings - function that calls on a procedure to generate user ranking object depending on the parameters
    // PRECONDITIONS (5 parameters):
    // 1.) abb: a string representing the unique identifier for a game
    // 2.) category: a string representing a valid category
    // 3.) type: a string, either "score" or "time"
    // 4.) live: a boolean value representing whether or not to filter by live submissions
    // 5.) profileId: the id of the user whose rankings we want to grab
    // POSTCONDITIONS (2 possible outcomes):
    // if the query is successful, a user ranking object is is returned
    // otherwise, this function throws an error, which should be handled by the caller function
    const getUserRankings = async (abb, category, type, live, profileId) => {
        try {
            const { data: rankings, error } = await supabase.rpc("get_user_rankings", { 
                abb: abb, 
                category: category,
                score: type === "score",
                live_only: live,
                profile_id: profileId
            });

            // error handling
            if (error) {
                throw error;
            }

            return rankings;

        } catch (error) {
            // if we get an error, throw for caller function to handle
            throw error;
        };
    };

    // FUNCTION 5: getChartSubmissions - function that calls on a procedure to generate the list of submissions for a particular chart
    // PRECONDITIONS (5 parameters):
    // 1.) abb: a string representing the unique identifier for a game
    // 2.) category: a string representing a valid category
    // 3.) level: a string representing the name of the level whose chart data we need to query
    // 4.) type: a string, either "score" or "time"
    // POSTCONDITIONS (2 possible outcomes):
    // if the query is successful, an array of submissions, ordered by record in descending order, then by submitted_at in ascending
    // order, is returned
    // otherwise, this function throws an error, which should be handled by the caller function
    const getChartSubmissions = async (abb, category, level, type) => {
        try {
            const { data: submissions, error } = await supabase.rpc("get_chart_submissions", { 
                game: abb, 
                category_name: category,
                level: level,
                is_score: type === "score"
            });

            // error handling
            if (error) {
                throw error;
            }

            return submissions;

        } catch (error) {
            // if we get an error, throw for caller function to handle
            throw error;
        };
    };

    // FUNCTION 6: getUnapproved - function that grabs all submissions that have not yet been approved
    // PRECONDITIONS: NONE
    // POSTCONDITIONS (2 possible outcomes, 1 return):
    // if the query is a success, an array containing all of the unapproved submissions will be returned
    // otherwise, this function will throw an error, which should be handled by the caller function
    const getUnapproved = async () => {
        try {
            const { data: unapproved, error } = await supabase.rpc("get_unapproved");

            // error handling
            if (error) {
                throw error;
            }

            // return the array of unapproved submissions
            return unapproved;

        } catch (error) {
            // error will be handled by caller function
            throw error;
        }
    };

    // FUNCTION 7: getUnapprovedCounts - function that grabs the count of unapproved submissions, either for a list of games, or all
    // games
    // PRECONDITIONS (1 parameter):
    // 1.) games: an array of game strings (abbs), which is set if the current user is a moderator. otherwise, an empty array is supplied,
    // which should return the result for ALL games
    // POSTCONDITIONS (2 possible outcomes):
    // if the query is successful, an array of objects, one for each game, is returned, which specifies the count of unapproved
    // submissions per game
    // if the query is unsuccessful, an error is thrown, which is to be handled by the caller function
    const getUnapprovedCounts = async games => {
        try {
            const { data: gameCounts, error } = await supabase.rpc("get_unapproved_counts", { abbs: games });

            // error handling
            if (error) {
                throw error;
            }

            return gameCounts;

        } catch (error) {
            // error should be handled by the caller function
            throw error;
        };
    };

    // FUNCTION 8: getUnapprovedByGame - function that grabs all the unapproved submissions for a particular game
    // PRECONDITIONS (1 parameter):
    // 1.) abb: a string corresponding to the primary key of a game
    // POSTCONDITIONS (2 possible outcomes):
    // if the query is successful, an array of submissions is simply returned, sorted by the submission id in descending order
    // if the query is not successful, an error is thrown, which is expected to be handled by the caller function
    const getUnapprovedByGame = async abb => {
        try {
            const { data: submissions, error } = await supabase.rpc("get_unapproved", { abb: abb });

            // error handling
            if (error) {
                throw error;
            }

            return submissions;

        } catch (error) {
            // error should be handled by the caller function
            throw error;
        };
    };

    // FUNCTION 9: getReportedByGame - function that grabs all the reported submissions for a particular game
    // PRECONDITIONS (1 parameter):
    // 1.) abb: a string corresponding to the primary key of a game
    // POSTCONDITIONS (2 possible outcomes):
    // if the query is successful, an array of submissions is simply returned, sorted by the submission id in descending order
    // if the query is not successful, an error is thrown, which is expected to be handled by the caller function
    const getReportedByGame = async abb => {
        try {
            const { data: submissions, error } = await supabase.rpc("get_reported", { abb: abb });

            // error handling
            if (error) {
                throw error;
            }

            return submissions;

        } catch (error) {
            // error should be handled by the caller function
            throw error;
        };
    };

    // FUNCTION 10: getProfile - function that can grab a single profile using a profile id
    // PRECONDITIONS (1 parameter):
    // 1.) profileId: an integer corresponding to the primary key of a profile in the database
    // POSTCONDITIONS (2 possible outcomes):
    // if the query is successful, a profile object is simply returned
    // if the query is unsuccessful, this function will throw an error, which should be handled by the caller function
    const getProfile = async profileId => {
        try {
            const { data: profile, error } = await supabase.rpc("get_profile", {
                p_id: profileId
            });

            // error handling
            if (error) {
                throw error;
            }

            return profile;

        } catch (error) {
            // error should be handled by the caller function
            throw error;
        };
    };

    return { 
        getRecords, 
        getTotals, 
        getMedals, 
        getUserRankings, 
        getChartSubmissions, 
        getUnapproved, 
        getUnapprovedCounts, 
        getUnapprovedByGame,
        getReportedByGame,
        getProfile
    };
};

/* ===== EXPORTS ===== */
export default RPCRead;