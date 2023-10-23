/* ===== IMPORTS ===== */
import { MessageContext } from "../../utils/Contexts";
import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import RPCRead from "../../database/read/RPCRead";
import ScrollHelper from "../../helper/ScrollHelper";

const UserLayout = () => {
    /* ===== VARIABLES ===== */
    const navigate = useNavigate();

    /* ===== CONTEXTS ===== */

    // add message function from message context
    const { addMessage } = useContext(MessageContext);

    /* ===== FUNCTIONS ===== */
    
    // database functions
    const { getProfile } = RPCRead();

    // helper functions
    const { scrollToId } = ScrollHelper();

    // FUNCTION 1: fetchProfile - code that is executed when the UserLayout component mounts, to fetch the desired profile
    // PRECONDITIONS (1 parameter):
    // 1.) profileId: an integer corresponding to the primary key of a profile in the database
    // POSTCONDITIONS (2 possible outcomes):
    // if the query is successful, a profile object is simply returned
    // if the query is unsuccessful, this function will render an error message to the screen, and return an undefined object,
    // leaving the `UserLayout` component stuck loading
    const fetchProfile = async profileId => {
        try {
            const profile = await getProfile(profileId);
            return profile;
        } catch (error) {
            addMessage("There was an issue fetching this users data.", "error");
            return undefined;
        };
    };

    // FUNCTION 2: scrollToRight - code that executes when the content within `user-layout-right` is updated
    // PRECONDITIONS: NONE
    // POSTCONDITIONS (1 possible outcome):
    // the document is scrolled such that the `user-layout-right` container is at the top of the device
    const scrollToRight = () => {
        scrollToId("user-layout-right");
    };

    // FUNCTION 3: onStatsClick - code that executes when the user hits a button to view players stats
    // PRECONDITIONS (3 parameters):
    // 1.) abb: a string corresponding to the primary key of a game in the database
    // 2.) category: a string representing a valid category
    // 3.) type: a string, either "score" or "time"
    // POSTCONDITIONS (1 possible outcome):
    // the page is updated to include stats for the selected (`abb` + `category` + `type`) combination, and the page is
    // automatically scrolled to the stats section of the page
    const onStatsClick = (abb, category, type) => {
        navigate(`${ abb }/${ category }/${ type }`);
        scrollToRight();
    };

    return { fetchProfile, scrollToRight, onStatsClick };
};

/* ===== EXPORTS ===== */
export default UserLayout;