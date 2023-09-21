/* ===== IMPORTS ===== */
import { supabase } from "../SupabaseClient";

/* ===== FUNCTIONS ===== */

const ApproveUpdate = () => {
    /* ===== FUNCTIONS ===== */

    // FUNCTION 1: insertApproval - function that inserts an approval into the database for a particular submission
    // PRECONDITIONS (2 parameters):
    // 1.) submissionId: a string in the postgreSQL timestamptz format, which uniquely identifies a valid submission
    // 2.) creatorId: the creator of the submission, which in most cases, should be the profile id of the current authenticated user
    // POSTCONDITIONS (2 possible outcomes):
    // if the approval is successfully created in the database, this function will simply return
    // otherwise, this function will throw an error, which should be handled by the parent function
    const insertApproval = async (submissionId, creatorId) => {
        try {
            const { error } = await supabase
                .from("approve")
                .insert({ submission_id: submissionId, creator_id: creatorId });

            // error handling
            if (error) {
                throw new Error("approve", { error });
            }

        } catch (error) {
            // handle error in caller function
            throw error;
        };
    };
    
    return { insertApproval };
};

/* ===== EXPORTS ===== */
export default ApproveUpdate;
