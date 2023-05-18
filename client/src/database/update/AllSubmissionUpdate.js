/* ===== IMPORTS ===== */
import { supabase } from "../SupabaseClient";

const AllSubmissionUpdate = () => {
    /* ===== FUNCTIONS ===== */

     // FUNCTION 1: insertSubmission - function that takes submission data and submits it to the all_submission table
     // PRECONDITIONS (1 parameter):
     // 1.) submission: a submission object, which has all fields matching the all_submission table
     // POSTCONDITIONS (2 possible outcomes):
     // if the query is successful, the function will simply return
     // if the query is unsuccessful, the function will alert the user of the error, and return
     const insertSubmission = async submission => {
        try {
            const { error } = await supabase
                .from("all_submission")
                .insert(submission);

            // error handling
            if (error) {
                throw error;
            }
            
        } catch (error) {
            console.log(error);
            alert(error.message);
        }
    };

    // FUNCTION 2: updateSubmission - function that takes submission data and updates an already existing submission in the
    // all_submission table
    // PRECONDITIONS (1 parameter):
    // 1.) submission: a submission object, which has all fields matching the all_submission table
    // POSTCONDITIONS (2 possible outcomes):
    // if the query is successful, the function will simply return
    // if the query is unsuccessful, the function will throw an error, which will be handled by the caller function
    const updateSubmission = async submission => {
        try {
            const { error } = await supabase
                .from("all_submission")
                .update(submission)
                .eq("id", submission.id);
            
            // error handling
            if (error) {
                throw error;
            }

        } catch (error) {
            // error will be handled by the caller function
            throw error;
        };
    };

    return { insertSubmission, updateSubmission };
};

/* ===== EXPORTS ===== */
export default AllSubmissionUpdate;