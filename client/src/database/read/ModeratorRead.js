/* ===== IMPORTS ===== */
import { supabase } from "../SupabaseClient";

const ModeratorRead = () => {
    /* ===== FUNCTIONS ===== */
    
    // FUNCTION 1: queryModerators - async function that makes a call to supabase to get an array of all the moderators
    // PRECONDITIONS: NONE
    // POSTCONDITIONS (2 possible outcomes):
    // if the query is successful, the list of moderators is simply returned
    // otherwise, the user is alerted of the error, and an empty array is returned
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
            console.log(error);
            alert(error.message);
            return [];
        }
    };

    // FUNCTION 2: isModerator - async function that makes a call to supabase to determine whether or not the given user is a moderator
    // PRECONDITIONS (1 parameter):
    // 1.) userId - a string corresponding to the uuid of a user, typically the currently signed-in user
    // POSTCONDITIONS (2 possible outcomes):
    // if the query is successful, return a boolean value: true if the user is a moderator, and false otherwise
    // otherwise, the user is alerted of the error, and false is returned
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
            console.log(error);
            alert(error.message);
            return false;
        }
    };

    return { queryModerators, isModerator };
};

/* ===== EXPORTS ===== */
export default ModeratorRead;