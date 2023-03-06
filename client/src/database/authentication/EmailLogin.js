import { supabase } from "../SupabaseClient";

const EmailLogin = () => {
    // FUNCTION 1: login - attempt to log in a user
    // PRECONDITIONS (1 parameter):
    // 1.) email: a string that represents the email of the user attempting to login
    // POSTCONDITIONS (1 returns):
    // 1.) if successful, an email should be sent to the email address provided, which will allow the user
    // to complete the login process. if a failure, an error will be thrown by this function
    const login = async (email) => {
        try {
            // attempt to login
            const { error } = await supabase
                .auth
                .signInWithOtp({ email });

            // error handling
            if (error) {
                throw error;
            }

        } catch (error) {
            // error will be handled in a higher-up function
            throw error;
        }
    };

    return { login };
};

export default EmailLogin;