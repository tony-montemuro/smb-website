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
     const insertSubmission = async (submission) => {
        try {
            const { error } = await supabase
                .from("all_submission")
                .insert(submission, {
                    returning: "minimal", // Don't return the value after inserting
                });

            // error handling
            if (error) {
                throw error;
            }
            
        } catch (error) {
            console.log(error);
            alert(error.message);
        }
    };

    return { insertSubmission };
};

/* ===== EXPORTS ===== */
export default AllSubmissionUpdate;