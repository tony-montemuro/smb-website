/* ===== IMPORTS ===== */
import { supabase } from "../SupabaseClient";

const GameRead = () => {
    /* ===== FUNCTIONS ===== */

    // FUNCTION 1: queryRecentGameSubmissions - function that retrieves the 5 most recent submissions in the database given some abb, and
    // returns them
    const queryRecentGameSubmissions = async (abb) => {
        try {
            const { data: submissions, error } = await supabase
                .from("all_submission")
                .select(`
                    all_position,
                    id,
                    level (
                        name
                    ),
                    position,
                    user:profiles (
                        country,
                        id,
                        username
                    ),
                    proof,
                    record,
                    score
                `)
                .eq("game_id", abb)
                .order("id", { ascending: false })
                .limit(5);
            
            // error handling
            if (error) {
                throw error;
            }

            // if we made it this far, simply return the data
            return submissions;

        } catch (error) {
            console.log(error);
            alert(error.message);
        };
    };

    return { queryRecentGameSubmissions };
};

/* ===== EXPORTS ===== */
export default GameRead;