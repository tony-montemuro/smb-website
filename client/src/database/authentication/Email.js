/* ===== IMPORTS ===== */
import { supabase } from "../SupabaseClient";

const Email = () => {
    /* ===== FUNCTIONS ===== */

    // FUNCTION 1: updateEmail - attempt to update the email of a user
    // 1.) email: a string that represents the new email of the user attempting to update their email
    // POSTCONDITIONS (2 possible outcomes):
    // if successful, an email should be sent to both the current and new email address provided, which will allow the user
    // to complete the email updating process.
    // if a failure, an error will be thrown by this function
    const updateEmail = async email => {
        try {
            // attempt to change email
            const { error } = await supabase
                .auth
                .updateUser({ email: email });

            // error handling
            if (error) {
                throw error;
            }

        } catch (error) {
            // error will be handled in a higher-up function
            throw error;
        };
    };

    return { updateEmail };
};

/* ===== EXPORTS ===== */
export default Email;