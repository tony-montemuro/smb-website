/* ===== IMPORTS ===== */
import { supabase } from "../SupabaseClient";

const SubmissionRead = () => {
    /* ===== FUNCTIONS ===== */

    // FUNCTION 1: queryRecentSubmissions - function that retrieves the most recent submissions in the database, given parameters to the
    // function as filters, and returns them, as well as the total number of submissions that match the filters
    // PRECONDITIONS (3 parameters):
    // 1.) start: an integer representing the index of the first submission we should query
    // 2.) end: an integer representing the index of the last submission we should query
    // 3.) searchParams: a URLSearchParams objects containing the set of filters
    // POSTCONDITIONS (2 possible outcomes):
    // if the query is successful, the (end-start) most recent submissions from the database matching the filters in `searchParams` are returned,
    // sorted from most recent to least recent, as well as the total number of submissions that match the filters
    // if the query is a failure, this function throws an error, which is expected to be handled by the caller function
    const queryRecentSubmissions = async (start, end, searchParams) => {
        // first, we define our base query
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
            `,
            { count: "exact" }
            )

            // add filters to our query according to `searchParams`, if it's defined
            if (searchParams) {
                // create an define object that will contain all our filters
                const filters = {};
                for (const [key, value] of searchParams) {
                    if (filters[key]) {
                        filters[key].push(value);
                    } else {
                        filters[key] = [value];
                    }
                }

                // add an `in` method for each key => value pair
                Object.keys(filters).forEach(key => {
                    query = query.in(key, filters[key]);
                });
            }

            // finally, add our pagenation limits, and ordering
            query = query.range(start, end).order("id", { ascending: false });

        try {
            // now, perform the query
            const { data: submissions, count, error } = await query;

            // error handling
            if (error) {
                throw error;
            }

            // if we made it here, let's just return the submissions, as well as the count
            return { submissions, count };

        } catch (error) {
            throw error;
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
                    mod_note,
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
                .order("submitted_at", { ascending: false })
                .order("id", { ascending: false });

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