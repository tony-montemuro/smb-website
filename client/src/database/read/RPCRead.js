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

    return { getRecords, getTotals, getMedals, getUserRankings };
};

/* ===== EXPORTS ===== */
export default RPCRead;