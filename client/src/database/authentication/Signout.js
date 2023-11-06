/* ===== IMPORTS ===== */
import { MessageContext } from "../../utils/Contexts";
import { supabase } from "../SupabaseClient";
import { useContext } from "react";

const Signout = () => {
    /* ===== CONTEXTS ===== */

    // add message function from message context
    const { addMessage } = useContext(MessageContext);

    /* ===== FUNCTIONS ===== */

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

            // if sign out was a success, let's inform the user
            addMessage("You have successfully logged out!", "success", 7000);

        } catch (error) {
            addMessage("There was a problem logging you out.", "error", 7000);
        }
    };

    return { signOut };
};

/* ===== EXPORTS ===== */
export default Signout;