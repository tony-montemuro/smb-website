import { supabase } from "../SupabaseClient";

const SubmissionsUpdate = () => {
    // function that approves a submission given some submission information
    const approve = async (submission) => {
        try {
            const { error } = await supabase
                .from("submission")
                .update({ approved: true })
                .eq("user_id", submission.user_id)
                .eq("game_id", submission.game_id)
                .eq("level_id", submission.level_id)
                .eq("score", submission.score);

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