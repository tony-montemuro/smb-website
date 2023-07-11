/* ===== IMPORTS ===== */
import { supabase } from "../SupabaseClient";

const SubmissionRead = () => {
    /* ===== FUNCTIONS ===== */

    // FUNCTION 1: query - an internal module function that actually performs query to get submissions
    // PRECONDITIONS (3 parameters):
    // 1.) abb: a string value, representing a game's abb value. this is used to uniquely identify it.
    // 2.) category: a string value, either "main" or "misc".
    // 3.) type: a string value, either "score" or "time".
    // POSTCONDITIONS (2 possible outcomes):
    // if the query is a success, an array of submissions belonging to the game (specified by abb) category and type,
    // ordered by level id, then record, then submission date
    // if the query is unsuccessful, the error is thrown to be handled by the caller function
    const query = async (abb, category, type) => {
        try {
            const { data: submissions, error, status } = await supabase
                .from("submission")
                .select(`
                    level!inner (name, misc, chart_type, time, id),
                    profile (id, username, country),
                    details:all_submission (
                        all_position,
                        comment,
                        id,
                        live,
                        monkey (id, monkey_name),
                        position,
                        proof,
                        record,
                        region (id, region_name),
                        submitted_at
                    ),
                    report (
                        creator_id
                    ),
                    score,
                    approved
                `)
                .eq("game_id", abb)
                .eq("level.misc", category === "misc" ? true : false)
                .eq("score", type === "score" ? true : false);

            // error handling
            if (error && status !== 406) {
                throw error;
            }

            // now, sort the array first by the level.id field in descending order, then by the details.record field in descending order.
            // finally, by the details.submitted_at field ascending order, and return array
            submissions.sort((a, b) => {
                if (a.level.id !== b.level.id) {
                    return a.level.id - b.level.id;
                }
                if (b.details.record !== a.details.record) {
                    return b.details.record - a.details.record 
                }
                return a.details.submitted_at.localeCompare(b.details.submitted_at);
            });

            return submissions;

        } catch (error) {
            // error to be handled by caller function
            throw error;
        }
    };

    // FUNCTION 2: getSubmissions - the public facing function used to get a list of submissions given some parameters
    // PRECONDITIONS (4 parameters):
    // 1.) abb: a string value, representing a game's abb value. this is used to uniquely identify it.
    // 2.) category: a string value, either "main" or "misc".
    // 3.) type: a string value, either "score" or "time".
    // 4.) submissionReducer: an object with two fields:
		// a.) reducer: the submission reducer itself (state)
		// b.) dispatchSubmissions: the reducer function used to update the reducer
    // POSTCONDITIONS (3 possible outcomes):
    // if user is accessing already cached submissions, we can fetch this information from submissionReducer.
    // if not, we query, and if the query is successful, we update the submission reducer, and return the array of submissions
    // if not, we query, and if the query is unsuccessful, this function throws an error to be handled by the caller function
    const getSubmissions = async (abb, category, type, submissionReducer) => {
        // initialize submissions object
        let submissions = {};

        // we have two choices: fetch submissions from cache if they are already there, or query them, update cache, and return result
        if (abb in submissionReducer.state && category in submissionReducer.state[abb] && type in submissionReducer.state[abb][category]) {
            submissions = submissionReducer.state[abb][category][type];
        } else {
            // attempt to query submissions. if the query is successful, we must also update the submissionReducer cache
            try {
                submissions = await query(abb, category, type);
                submissionReducer.dispatchSubmissions({ abb: abb, category: category, type: type, data: submissions });
            } 
            
            // in the event of an error, it will be thrown by the function to be handled by the caller function
            catch (error) {
                throw error;
            }
        }
        return submissions;
    };

    // FUNCTION 3: getUnapproved - function that grabs all submissions that have not yet been approved [note: this function does NOT
    // cache submissions]
    // PRECONDITIONS: NONE
    // POSTCONDITIONS (2 possible outcomes, 1 return):
    // if the query is a success, an array containing all of the unapproved submissions will be returned
    // otherwise, this function will throw an error, which should be handled by the caller function
    const getUnapproved = async () => {
        try {
            const { data: unapproved, error } = await supabase
                .from("submission")
                .select(`
                    details:all_submission (
                        all_position,
                        comment,
                        id,
                        live,
                        monkey (id, monkey_name),
                        position,
                        proof,
                        record,
                        region (id, region_name),
                        submitted_at
                    ),
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
                    profile (
                        country,
                        id,
                        username
                    ),
                    report (
                        creator:profile (
                            country,
                            id,
                            username
                        ),
                        profile_id
                    ),
                    score
                `)
                .eq("approved", false);

            // error handling
            if (error) {
                throw error;
            }

            // next, order the submissions in ascending order by the `details.id` field
            const ordered = unapproved.sort((a, b) => a.details.id.localeCompare(b.details.id));

            // return the ordered array of unapproved submissions
            return ordered;

        } catch (error) {
            // error will be handled by caller function
            throw error;
        }
    };

    return { getSubmissions, getUnapproved };
};

/* ===== EXPORTS ===== */
export default SubmissionRead;