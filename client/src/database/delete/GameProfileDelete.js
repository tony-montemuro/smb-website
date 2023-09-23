/* ===== IMPORTS ===== */
import { supabase } from "../SupabaseClient";

const GameProfileDelete = () => {
    /* ===== FUNCTIONS ===== */

    // FUNCTION 1: deleteModerator - function that makes a delete call to the game_profile table in the database based on a game & profile
    // PRECONDITIONS (2 parameters):
    // 1.) abb: a string corresponding to the primary key of a game
    // 2.) profileId: an integer corresponding to the primary key of a user who is a moderator of `abb`
    // POSTCONDITIONS (2 possible outcomes):
    // if the query is a success, the user is revoked their moderation privileges, and the function simply returns
    // if the query fails, this function throws an error to the caller function, where it is handled
    const deleteModerator = async (abb, profileId) => {
        try {
            const { error } = await supabase
                .from("game_profile")
                .delete()
                .match({ game: abb, profile: profileId });

            // error handling
            if (error) {
                throw error;
            }

        } catch (error) {
            // error to be handled by caller function
            throw error;
        }
    };

    return { deleteModerator };
};

/* ===== EXPORTS ===== */
export default GameProfileDelete;