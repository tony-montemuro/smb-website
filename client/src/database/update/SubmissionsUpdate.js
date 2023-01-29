import { supabase } from "../SupabaseClient";

const SubmissionsUpdate = () => {
    // function that approves a submission given some submission information
    const approve = async (submission) => {
        try {
            const { error } = await supabase
                .from(`${ submission.type }_submission`)
                .update({ approved: true })
                .eq("user_id", submission.user_id)
                .eq("game_id", submission.game_id)
                .eq("level_id", submission.level_id);

            // error handling
            if (error) {
                throw error;
            }

        } catch (error) {
            throw error;
        }
    };

    return { approve };
};

export default SubmissionsUpdate;