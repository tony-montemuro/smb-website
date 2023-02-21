import { supabase } from "../SupabaseClient";

const SubmissionRead = () => {
    // function that reads submission data from the database based on the abb, category, and type
    const query = async (abb, category, type) => {
        try {
            const { data: submissionsList, error, status } = await supabase
                .from("submission")
                .select(`
                    level!inner (name, misc, chart_type, time, id),
                    user:profiles (id, username, country, avatar_url),
                    details:all_submission (
                        id,
                        record,
                        region (id, region_name),
                        submitted_at,
                        monkey (id, monkey_name),
                        proof,
                        comment,
                        live
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
            submissionsList.sort((a, b) => {
                if (a.level.id !== b.level.id) {
                    return a.level.id - b.level.id;
                }
                if (b.details.record !== a.details.record) {
                    return b.details.record - a.details.record 
                }
                return a.details.submitted_at.localeCompare(b.details.submitted_at);
            });

            return submissionsList;

        } catch (error) {
            console.log(error);
            alert(error.message);
            return [];
        }
    };

    // two cases: if user is accessing already cached submissions, we can fetch this information from submissionReducer.
    // otherwise, we need to query, and update the submission reducer
    const getSubmissions = async (abb, category, type, submissionReducer) => {
        // initialize submissions object
        let submissions = {};

        // we have two choices: fetch submissions from cache if they are already there, or query them, update cache, and return result
        if (abb in submissionReducer.state && category in submissionReducer.state[abb] && type in submissionReducer.state[abb][category]) {
            submissions = submissionReducer.state[abb][category][type];
        } else {
            submissions = await query(abb, category, type);
            submissionReducer.dispatchSubmissions({ abb: abb, category: category, type: type, data: submissions });
        }
        return submissions;
    }

    return { getSubmissions };
};

export default SubmissionRead;