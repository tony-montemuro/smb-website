/* ===== IMPORTS ===== */
import { StaticCacheContext } from "../../Contexts";
import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";

const User = () => {
    /* ===== CONTEXTS ===== */

    // static cache state from static cache context
    const { staticCache } = useContext(StaticCacheContext);

    /* ===== VARIABLES ===== */
    const navigate = useNavigate();

    /* ===== STATES ===== */
    const [user, setUser] = useState(null);

    /* ===== FUNCTIONS ===== */

    // FUNCTION 1: fetchUser - find user data from the list of profiles
    // PRECONDITINOS (1 parameter):
    // 1.) userId: a string value, representing a userId. this value is grabbed from the url path.
    // POSTCONDITIONS (2 possible outcomes):
    // 1.) .find() method returns a null object. (invalid userId) in this case, the function will handle this error, navigate
    // the user back to the home screen, and return early
    // 2.) .find() method returns a profile object. in this case, we need to call the setUser() function to update the user state
    const fetchUser = userId => {
        const profiles = staticCache.profiles;
        const currentUser = profiles.find(row => row.id === userId);
        if (!currentUser) {
            console.log("Error: Invalid user.");
            navigate("/");
            return;
        }
        setUser(currentUser);
    };

    // FUNCTION 2: alertDiscord - alert the client of a discord username
    // PRECONDITINOS (1 parameter):
    // 1.) discord: a string value, representing a discord username.
    // POSTCONDITION:
    // an alert popup is thrown by the browser, containing a message that displays the discord username
    const alertDiscord = discord => {
        alert(`Discord username: ${ discord }.`);
    };

    return {  
        user,
        fetchUser,
        alertDiscord
    };
};

export default User;