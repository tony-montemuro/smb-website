import { supabase } from "../SupabaseClient";

const LevelboardDelete = () => {
    // function that takes a submission object, and removes it from the {type} submission table
    const remove = async (submission) => {
        try {
            const type = submission.type;
            const userId = submission.user_id, gameId = submission.game_id, levelId = submission.level_id;
            const { error } = await supabase
                .from(`${ type }_submission`)
                .delete()
                .match({ user_id: userId, game_id: gameId, level_id: levelId });

            // error handling
            if (error) {
                throw error;
            }

        } catch (error) {
            console.log(error);
            alert(error.message);
            return false;
        }
        return true;
    };

    const deleteSubmission = async (id) => {
        try {
            const { error } = await supabase
                .from(`all_submission`)
                .delete()
                .match({ id: id });

            // error handling
            if (error) {
                throw error;
            }
            
        } catch (error) {
            console.log(error);
            alert(error.message);
        }
    };

    return { remove, deleteSubmission };
};

export default LevelboardDelete;