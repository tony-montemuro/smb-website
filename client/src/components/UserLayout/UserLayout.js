/* ===== IMPORTS ===== */
import { MessageContext } from "../../utils/Contexts";
import { useContext } from "react";
import RPCRead from "../../database/read/RPCRead";

const UserLayout = () => {
    /* ===== CONTEXTS ===== */

    // add message function from message context
    const { addMessage } = useContext(MessageContext);

    /* ===== FUNCTIONS ===== */
    
    // database functions
    const { getProfile } = RPCRead();

    // FUNCTION 1: fetchProfile - code that is executed when the UserLayout component mounts, to fetch the desired profile
    // PRECONDITIONS (1 parameter):
    // 1.) profileId: an integer corresponding to the primary key of a profile in the database
    // POSTCONDITIONS (2 possible outcomes):
    // if the query is successful, a profile object is simply returned
    // if the query is unsuccessful, this function will render an error message to the screen, and return an undefined object,
    // leaving the `UserLayout` component stuck
    // loading
    const fetchProfile = async profileId => {
        try {
            const profile = await getProfile(profileId);
            return profile;
        } catch (error) {
            addMessage("There was an issue fetching this users data.", "error");
            return undefined;
        };
    };

    return { fetchProfile };
};

/* ===== EXPORTS ===== */
export default UserLayout;