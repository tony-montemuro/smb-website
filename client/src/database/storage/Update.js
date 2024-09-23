/* ===== IMPORTS ===== */
import { supabase } from "../SupabaseClient";

const Update = () => {
    /* ===== FUNCTIONS ===== */

    // FUNCTION 1: updateBoxartName - code that updates the filename of a boxart asset in storage
    // PRECONDITIONS (2 parameters):
    // 1.) oldAbb: the old name (abb) of the file we need to update
    // 2.) newAbb: the new name (abb) of the file
    // POSTCONDITIONS (2 possible outcomes):
    // if the query is successful, this function will simply return
    // if the query is unsuccessful, this function will throw an error, which should be handled by the caller function
    const updateBoxartName = async (oldAbb, newAbb) => {
        try {
            const { error } = await supabase
                .storage
                .from("games")
                .move(`${ oldAbb }.png`, `${ newAbb }.png`);

            // error handling
            if (error) {
                throw error;
            }

        } catch (error) {
            // error should be handled by the caller function
            throw error;
        }
    };
    
    return { updateBoxartName };
};

/* ===== EXPORTS ===== */
export default Update;