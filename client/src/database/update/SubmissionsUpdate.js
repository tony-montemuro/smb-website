import { supabase } from "../SupabaseClient";

const SubmissionsUpdate = () => {
    // function that approves a submission given some submission information
    const approve = async (type, userId, gameId, levelId) => {
        try {
            const { error } = await supabase
                .from(`${ type }_submission`)
                .update({ approved: true })
                .eq("user_id", userId)
                .eq("game_id", gameId)
                .eq("level_id", levelId);

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