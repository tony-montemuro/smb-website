/* ===== IMPORTS ===== */
import { supabase } from "../SupabaseClient";

const Session = () => {
    /* ===== FUNCTIONS ===== */

    // FUNCTION 1: getSession - get the current session object
    // PRECONDITIONS: none
    // POSTCONDITIONS (1 returns, 2 possible outcomes):
    // if successful, we the session object for the current user
    // if failure, error is handled by caller function
    const getSession = async () => {
        try {
            // grab the session object from the database
            const { data: session, error } = await supabase.auth.getSession();

            // error handling
            if (error) {
                throw error;
            }

            // return the session object
            return session.session;

        } catch (error) {
            // error is handled by caller function
           throw error;
        }
    };

    return { getSession };
};

/* ===== EXPORTS ===== */
export default Session;