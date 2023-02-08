import { supabase } from "../SupabaseClient";

const SubmissionRead = () => {
    // function that reads submission data from the database based on the abb and type
    const query = async (abb, type) => {
        try {
            const { data: submissions, error, status } = await supabase
                .from(`${ type }_submission`)
                .select(`
                    profiles (id, username, country, avatar_url),
                    level (name, misc, chart_type, time, id),
                    ${ type },
                    region (id, region_name),
                    submitted_at,
                    monkey (id, monkey_name),
                    proof,
                    comment,
                    live,
                    approved
                `)
                .eq("game_id", abb)
                .order(type, { ascending: false })
                .order("submitted_at");

            // error handling
            if (error && status !== 406) {
                throw error;
            }

            // if we made it this far, simply return submissions
            return submissions;

        } catch(error) {
            console.log(error);
            alert(error.message);
            return [];
        }
    };

    // new query function
    const newQuery = async (abb, type) => {
        try {
            const { data: submissionsList, error, status } = await supabase
                .from("submission")
                .select(`
                    level (name, misc, chart_type, time, id),
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
                .eq("score", type === "score" ? true : false);

            // error handling
            if (error && status !== 406) {
                throw error;
            }

            // now, sort and return array
            submissionsList.sort((a, b) => a.details.submitted_at.localeCompare(b.details.submitted_at));
            submissionsList.sort((a, b) => b.details.record - a.details.record);
            return submissionsList;

        } catch (error) {
            console.log(error);
            alert(error.message);
            return [];
        }
    };

    
    // two cases: if user is accessing already cached submissions, we can fetch this information from submissionState.
    // Otherwise, we need to query, and set the submission state
    const retrieveSubmissions = async (abb, type, submissionState) => {
        let submissions = {};
        if (submissionState.state && abb in submissionState.state) {
            submissions = submissionState.state[abb];
        } else {
            submissions = await query(abb, type);
            submissionState.setState({ ...submissionState.state, [abb]: submissions });
        }
        return [...submissions];
    }

    return { retrieveSubmissions, newQuery };
};

export default SubmissionRead;