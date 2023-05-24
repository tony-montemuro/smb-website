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

    // FUNCTION 2: isModerator - async function that makes a call to supabase to determine whether or not the given user is a moderator
    // PRECONDITIONS (1 parameter):
    // 1.) userId - a string corresponding to the uuid of a user, typically the currently signed-in user
    // POSTCONDITIONS (2 possible outcomes):
    // if the query is successful, return a boolean value: true if the user is a moderator, and false otherwise
    // otherwise, an error is thrown to be handled by the caller function
    const isModerator = async (userId) => {
        try {
            const { data: moderator, error } = await supabase
                .from("moderator")
                .select("profile!inner(user_id)")
                .eq("profile.user_id", userId)
                .maybeSingle();

            // error handling
            if (error) {
                throw error;
            }

            // return true if moderator returns an object; false otherwise
            return moderator ? true : false;
        
        } catch (error) {
            // error to be handled by caller function
            throw error;
        }
    };

    return { queryModerators, isModerator };
};

/* ===== EXPORTS ===== */
export default ModeratorRead;