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

            // if we made it this far, query was successful. reload the page
            window.location.reload();

        } catch (error) {
            console.log(error);
            alert(error.message);
        }
    };

    return { remove };
};

export default LevelboardDelete;