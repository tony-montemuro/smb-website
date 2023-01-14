import { supabase } from "../components/SupabaseClient/SupabaseClient";

const SubmissionQuery = () => {
    const query = async(abb, type) => {
        try {
            const { data: submissions, error, status } = await supabase
                .from(`${ type }_submission`)
                .select(`
                    profiles (id, username, country, avatar_url),
                    level (name, misc, chart_type, time, id),
                    ${ type },
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

    return { query };
};

export default SubmissionQuery;