/* ===== IMPORTS ===== */
import { supabase } from "../SupabaseClient";

const Submission2Read = () => {
    /* ===== FUNCTIONS ===== */

    // FUNCTION 1: query - an internal module function performs query to get ALL submissions for a game
    // PRECONDITIONS (3 parameters):
    // 1.) abb: a string value, representing a game's abb value. this is used to uniquely identify it.
    // POSTCONDITIONS (2 possible outcomes):
    // if the query is a success, an array of submissions belonging to the game (specified by abb),
    // ordered by level id, then profile id, then submission date, is returned
    // if the query is unsuccessful, the error is thrown to be handled by the caller function
    const query = async abb => {
        try {
            const { data: submissions, error, status } = await supabase
                .from("submission2")
                .select(`
                    all_position,
                    approve (
                        creator_id
                    ),
                    comment,
                    id,
                    level!inner (
                        category,
                        chart_type,
                        id,
                        name,
                        time,
                        timer_type
                    ),
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
                        id, 
                        username, 
                        country
                    ),
                    proof,
                    record,
                    region (
                        id, 
                        region_name
                    ),
                    report2 (
                        creator_id
                    ),
                    score,
                    submitted_at,
                    tas
                `)
                .eq("game_id", abb);

            // error handling
            if (error && status !== 406) {
                throw error;
            }

            // now, sort the array first by the level.id field in ascending order, then by the profile field in ascending order.
            // finally, by the submitted_at field ascending order, and return array
            submissions.sort((a, b) => {
                if (a.level.id !== b.level.id) {
                    return a.level.id - b.level.id;
                }
                if (b.profile.id !== a.profile.id) {
                    return a.profile.id - a.profile.id 
                }
                return a.submitted_at.localeCompare(b.submitted_at);
            });

            return submissions;

        } catch (error) {
            // error to be handled by caller function
            throw error;
        }
    };

    return { query };
};

/* ===== EXPORTS ===== */
export default Submission2Read;