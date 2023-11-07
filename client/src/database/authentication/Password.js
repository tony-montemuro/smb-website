/* ===== IMPORTS ===== */
import { supabase } from "../SupabaseClient";

const Password = () => {
    /* ===== FUNCTIONS ===== */

    // FUNCTION 1: updatePassword - attempt to update the password of current user
    // 1.) newPassword: a string that represents the new password of the user attempting to update their email
    // POSTCONDITIONS (2 possible outcomes):
    // if successful, the user's password should successfully reset, and the user can now sign in with their new password
    // if a failure, an error will be thrown by this function, which should be handled by the caller function
    const updatePassword = async newPassword => {
        try {
            // attempt to change email
            const { error } = await supabase
                .auth
                .updateUser({ password: newPassword });

            // error handling
            if (error) {
                throw error;
            }

        } catch (error) {
            throw error;
        };
    };

    return { updatePassword };
};

/* ===== EXPORTS ===== */
export default Password;