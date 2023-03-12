import { supabase } from "../SupabaseClient";

const Session = () => {
    // FUNCTION 1: getSession - get the current session object
    // PRECONDITIONS: none
    // POSTCONDITIONS (1 returns):
    // 1.) returns the session object for the current user
    const getSession = async () => {
        try {
            const { data: session, error } = await supabase.auth.getSession();
            if (error) {
                throw error;
            }

            return session.session;
        } catch (error) {
            console.log(error);
            alert(error.message);
        }
    };

    return { getSession };
};

export default Session;