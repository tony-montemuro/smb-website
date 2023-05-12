/* ===== IMPORTS ===== */
import { supabase } from "../SupabaseClient";

const SubmissionUpdate = () => {
    /* ===== FUNCTIONS ===== */

    // FUNCTION 1: approveSubmission - function that approves a submission given some submission information by updating the approved field
    // to true
    // PRECONDITIONS (1 parameter):
    // 1.) submission: a submission object containing some, but not all, submission information
    // POSTCONDITIONS (2 possible outcomes):
    // if the query is successful, this function will simply return
    // if the query is a failure, this function will throw the error, where it should be handled by the caller function
    const approveSubmission = async (submission) => {
        try {
            const { error } = await supabase
                .from("submission")
                .update({ approved: true })
                .eq("profile_id", submission.profile_id)
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

    return { approveSubmission };
};

/* ===== EXPORTS ===== */
export default SubmissionUpdate;