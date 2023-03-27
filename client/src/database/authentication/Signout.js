/* ===== IMPORTS ===== */
import { supabase } from "../SupabaseClient";

const Signout = () => {
    // FUNCTION 1: signOut - attempt to sign out a user
    // PRECONDITIONS (1 condition):
    // the application should have a currently signed-in user when this function is called
    // POSTCONDITIONS (2 possible outcomes):
    // if successful, the user will be signed out, and the session will be updated in App.js
    // if unsuccessful, we throw an error
    const signOut = async () => {
        try {
            // attempt to sign out
            const { error } = await supabase.auth.signOut();

            // error handling
            if (error) {
                throw error;
            }

        } catch (error) {
            // error will be handled in a higher-up function
            throw error;
        }
    };

    return { signOut };
};

/* ===== EXPORTS ===== */
export default Signout;