import { supabase } from "../SupabaseClient";

const LevelboardDelete = () => {
    // function that takes a submission object, and removes it from the all_submission table
    const remove = async (id) => {
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

    return { remove };
};

export default LevelboardDelete;