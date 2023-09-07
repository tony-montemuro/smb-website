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

    return { getRecords };
};

/* ===== EXPORTS ===== */
export default RPCRead;