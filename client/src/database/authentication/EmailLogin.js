/* ===== IMPORTS ===== */
import { supabase } from "../SupabaseClient";

const EmailLogin = () => {
    /* ===== FUNCTIONS ===== */

    // FUNCTION 1: login - attempt to log in a user
    // PRECONDITIONS (1 parameter):
    // 1.) email: a string that represents the email of the user attempting to login
    // POSTCONDITIONS (2 possible outcomes):
    // if successful, an email should be sent to the email address provided, which will allow the user
    // to complete the login process. 
    // if a failure, an error will be thrown by this function
    const login = async email => {
        try {
            // attempt to login
            const { error } = await supabase.auth.signInWithOtp({ 
                email: email,
                options: {
                    emailRedirectTo: `${ window.location.origin }/profile`
                }
            });

            // error handling
            if (error) {
                throw error;
            }

        } catch (error) {
            // error will be handled in a higher-up function
            throw error;
        };
    };

    // FUNCTION 2: updateEmail - attempt to update the email of a user
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

    return { login, updateEmail };
};

/* ===== EXPORTS ===== */
export default EmailLogin;