/* ===== IMPORTS ===== */
import { supabase } from "../SupabaseClient";

const SubmissionDelete = () => {
    /* ===== FUNCTIONS ===== */

    // FUNCTION 1: deleteSubmission - removes a submission from the database, given the submission id as an argument
    // PRECONDITIONS (1 parameter):
    // 1.) id: a string representing the id of the submission being deleted
    // POSTCONDITIONS (1 possible outcomes):
    // if the delete query is successful, this function simply returns
    // if the delete query is unsuccessful, this function throws an error, which will be handled in the caller function
    const deleteSubmission = async id => {
        try {
            const { error } = await supabase
                .from("submission2")
                .delete()
                .match({ id: id });

            // error handling
            if (error) {
                throw error;
            }
            
        } catch (error) {
            throw error;
        }
    };

    return { deleteSubmission };
};

/* ===== EXPORTS ===== */
export default SubmissionDelete;