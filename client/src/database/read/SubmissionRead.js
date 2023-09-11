/* ===== IMPORTS ===== */
import { MessageContext } from "../../utils/Contexts";
import { supabase } from "../SupabaseClient";
import { useContext } from "react";

const SubmissionRead = () => {
    /* ===== CONTEXTS ===== */

    // add message function from message context
    const { addMessage } = useContext(MessageContext);

    /* ===== FUNCTIONS ===== */

    // FUNCTION 1: queryRecentSubmissions - function that retrieves the 5 most recent submissions in the database, and returns them
    // PRECONDITIONS (1 parameter):
    // 1.) abb: a string value, representing a game's abb value. this is used to uniquely identify it. this value could be undefined:
    // in that case, the query will simply get the 5 most recent submissions. otherwise, the query will be filtered based on this parameter
    // POSTCONDITIONS (2 possible outcomes):
    // if the query is successful, the 5 most recent submissions from the database are returned, sorted from most recent to least recent
    // if the query is a failure, the user is alerted of the error, and an empty array is returned
    const queryRecentSubmissions = async abb => {
        // first, we define our query
        let query = supabase
            .from("submission")
            .select(`
                all_position,
                id,
                level (
                    category,
                    mode (
                        game (
                            abb,
                            name
                        )
                    ),
                    name,
                    timer_type
                ),
                position,
                profile (
                    country,
                    id,
                    username
                ),
                proof,
                record,
                score,
                tas
            `)
            .limit(5)
            .order("id", { ascending: false });
        query = abb ? query.eq("game_id", abb) : query;

        try {
            // now, perform the query
            const { data: submissions, error } = await query;

            // error handling
            if (error) {
                throw error;
            }

            // if we made it here, let's just return data
            return submissions;

        } catch (error) {
            addMessage("Recent submissions failed to load.", "error");
            return [];
        };
    };

    // FUNCTION 2: getChartSubmissionsByProfile - function that fetches all submissions by a particular user on a particular chart
    // PRECONDITIONS (4 parameters):
    // 1.) abb: a string that uniquely identifies a game
    // 2.) category: a string representing a valid category name
    // 3.) level: a string representing a valid level belonging to { abb, category } combination
    // 4.) type: a string, either "score" or "time"
    // 5.) profileId: the id of the profile who's submissions we seek to fetch
    // POSTCONDITIONS (2 possible outcomes):
    // if the query is successful, the list of submissions belonging to the user on the particular chart, sorted in descending
    // order by the `submitted_at` field, is returned
    // otherwise, this function will throw an error, which is to be handled by the caller function
    const getChartSubmissionsByProfile = async (abb, category, level, type, profileId) => {
        try {
            const { data: submissions, error } = await supabase
                .from("submission")
                .select(`
                    all_position,
                    approve (
                        creator_id
                    ),
                    comment,
                    id,
                    live,
                    monkey (
                        id, 
                        monkey_name
                    ),
                    platform (
                        id, 
                        platform_abb, 
                        platform_name
                    ),
                    position,
                    profile (
                        country,
                        id,
                        username
                    ),
                    proof,
                    record,
                    region (
                        id, 
                        region_name
                    ),
                    report (
                        creator_id
                    ),
                    score,
                    submitted_at,
                    tas
                `)
                .eq("game_id", abb)
                .eq("category", category)
                .eq("level_id", level)
                .eq("score", type === "score")
                .eq("profile_id", profileId)
                .order("submitted_at", { ascending: false });

            // error handling
            if (error) {
                throw error;
            }

            return submissions;

        } catch (error) {
            // error is expected to be handled by caller function
            throw error;
        }
    };

    return { queryRecentSubmissions, getChartSubmissionsByProfile };
};

/* ===== EXPORTS ===== */
export default SubmissionRead;