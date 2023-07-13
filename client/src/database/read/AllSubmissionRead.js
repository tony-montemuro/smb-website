/* ===== IMPORTS ===== */
import { MessageContext } from "../../utils/Contexts";
import { supabase } from "../SupabaseClient";
import { useContext } from "react";

const AllSubmissionRead = () => {
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
                profile (
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

    // FUNCTION 2: queryFilteredSubmissions - given a game, level, category, and type boolean, grab the list of all submissions
    // that correspond to these filters, ordered from most recent to least recent
    // PRECONDITIONS (4 parameters):
    // 1.) abb: a string value, representing a game's abb value. this is used to uniquely identify it.
    // 2.) levelName: a string value, representing the name of a level.
    // 3.) profileId: an integer value, representing a user's profile id.
    // 4.) isScore: a boolean value. true if the submission is a score, false otherwise.
    // POSTCONDITIONS (2 possible outcomes):
    // if the query is successful, the submissions that pass through the filter from the database are returned, sorted from most recent
    // to least recent
    // if the query is a failure, the user is alerted of the error, and an empty array is returned
    const queryFilteredSubmissions = async (abb, levelName, profileId, isScore) => {
        try {
            const { data: submissions, error } = await supabase
                .from("all_submission")
                .select(`
                    all_position,
                    comment,
                    id,
                    live,
                    monkey (id, monkey_name),
                    position,
                    proof,
                    record,
                    region (id, region_name),
                    submission (
                        approved,
                        report (
                            creator_id, 
                            profile_id
                        )
                    ),
                    submitted_at
                `)
                .eq("level_id", levelName)
                .eq("profile_id", profileId)
                .eq("score", isScore)
                .eq("game_id", abb)
                .order("id", { ascending: false });
            
            // error handling
            if (error) {
                throw error;
            }

            // if we made it this far, simply return the data
            return submissions;

        } catch (error) {
            addMessage("Submission history failed to load.", "error");
            return [];
        }
    };

    return { queryRecentSubmissions, queryFilteredSubmissions };
};

/* ===== EXPORTS ===== */
export default AllSubmissionRead;