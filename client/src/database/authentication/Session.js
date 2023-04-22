/* ===== IMPORTS ===== */
import { supabase } from "../SupabaseClient";

const Session = () => {
    // FUNCTION 1: getSession - get the current session object
    // PRECONDITIONS: none
    // POSTCONDITIONS (1 returns, 2 possible outcomes):
    // if successful, we the session object for the current user
    // if failure, we handle the error, and return null
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
            console.log(error);
            alert(error.message);
            return null;
        }
    };

    return { getSession };
};

/* ===== EXPORTS ===== */
export default Session;