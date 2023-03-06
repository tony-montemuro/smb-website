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
    }

    // FUNCTION 2: getUser - get information about the current user
    // PRECONDITIONS: none
    // POSTCONDITIONS (1 returns):
    // 1.) if a user is signed in, their corresponding user object will be returned. otherwise, a null object will
    // be returned
    const getUser = async () => {
        const session = await getSession();
        const { user } = session;
        return user;
    };

    return { getSession, getUser };
};

export default Session;