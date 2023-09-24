/* ===== IMPORTS ===== */
import { supabase } from "../SupabaseClient";

const GameProfileUpdate = () => {
    /* ===== FUNCTIONS ===== */

    // FUNCTION 1: insertModerator - function that can be called to add a new profile as a moderator to a particular game
    // PRECONDITIONS (2 parameters):
    // 1.) abb: a string corresponding to the primary key of a game
    // 2.) profileId: an integer corresponding to the primary key of a user who is a moderator of `abb`
    // POSTCONDITIONS (2 possible outcomes):
    // if the query is a success, the user is given moderation privileges, and the function simply returns
    // if the query fails, this function throws an error to the caller function, where it is handled
    const insertModerator = async (abb, profileId) => {
        try {
            const { error } = await supabase
                .from("game_profile")
                .insert({ game: abb, profile: profileId });

            // error handling
            if (error) {
                throw error;
            }

        } catch (error) {
            // error to be handled by caller function
            throw error;
        }
    };

    return { insertModerator };
};

/* ===== EXPORTS ===== */
export default GameProfileUpdate;