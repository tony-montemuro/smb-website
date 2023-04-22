/* ===== IMPORTS ===== */
import { supabase } from "../SupabaseClient";

const HomeRead = () => {
    /* ===== FUNCTIONS ===== */

    // FUNCTION 1: queryRecentSubmissions - function that retrieves the 5 most recent submissions in the database, and returns them
    const queryRecentSubmissions = async () => {
        try {
            const { data: submissions, error } = await supabase
                .from("all_submission")
                .select(`
                    all_position,
                    id,
                    level (
                        misc,
                        mode (
                            game (
                                abb,
                                name
                            )
                        ),
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
                .limit(5)
                .order("id", { ascending: false });

            // error handling
            if (error) {
                throw error;
            }

            // if we made it here, let's just return data
            return submissions;

        } catch (error) {
            console.log(error);
            alert(error.message);
            return [];
        };
    };

    return { queryRecentSubmissions };
};

/* ===== EXPORTS ===== */
export default HomeRead;