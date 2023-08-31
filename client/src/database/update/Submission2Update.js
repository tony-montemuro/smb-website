/* ===== IMPORTS ===== */
import { supabase } from "../SupabaseClient";

const Submission2Update = () => {
    /* ===== FUNCTIONS ===== */

    // FUNCTION 1: insertSubmission2 - function that takes submission data and submits it to the all_submission table
    // PRECONDITIONS (1 parameter):
    // 1.) submission: a submission object, which has all fields matching the submission table
    // POSTCONDITIONS (2 possible outcomes):
    // if the query is successful, the function will return
    // if the query is unsuccessful, the function will throw an error, which will be handled by the caller function
    const insertSubmission2 = async submission => {
        try {
            const { error } = await supabase
                .from("submission2")
                .insert(submission);

            // error handling
            if (error) {
                throw error;
            }
            
        } catch (error) {
            // handle error in caller function
            throw error;
        }
    };

    // FUNCTION 2: updateSubmission2 - function that takes submission data, as well as it's id, and updates an already existing
    // submission in the submission table
    // PRECONDITIONS (2 parameter):
    // 1.) submission: a submission object which contains only the 'updatable' fields
    // 2.) id: a string formatted in the timestamptz postgreSQL format, which represents the unique id of a submission
    // POSTCONDITIONS (2 possible outcomes):
    // if the query is successful, the function will simply return
    // if the query is unsuccessful, the function will throw an error, which will be handled by the caller function
    const updateSubmission2 = async (submission, id) => {
        try {
            const { error } = await supabase
                .from("submission2")
                .update(submission)
                .eq("id", id);
            
            // error handling
            if (error) {
                throw error;
            }

        } catch (error) {
            // error will be handled by the caller function
            throw error;
        };
    };

    return { insertSubmission2, updateSubmission2 };
};

/* ===== EXPORTS ===== */
export default Submission2Update;