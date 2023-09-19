/* ===== IMPORTS ===== */
import { supabase } from "../SupabaseClient";

const ModeratorRead = () => {
    /* ===== FUNCTIONS ===== */
    
    // FUNCTION 1: queryModerators - async function that makes a call to supabase to get an array of all the moderators
    // PRECONDITIONS: NONE
    // POSTCONDITIONS (2 possible outcomes):
    // if the query is successful, the list of moderators is simply returned
    // otherwise, this function throws an error, which should be handled by caller function
    const queryModerators = async () => {
        try {
            const { data: moderatorList, error, status } = await supabase
                .from("moderator")
                .select("*");

            // error handling
            if (error && status !== 406) {
                throw error;
            }

            // return data
            return moderatorList;

        } catch (error) {
            // throw error to be handled by caller
            throw error;
        }
    };

    return { queryModerators };
};

/* ===== EXPORTS ===== */
export default ModeratorRead;