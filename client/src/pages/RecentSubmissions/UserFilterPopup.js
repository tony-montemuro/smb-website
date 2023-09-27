/* ===== IMPORTS ===== */
import { MessageContext } from "../../utils/Contexts";
import { useContext, useState } from "react";
import ProfileRead from "../../database/read/ProfileRead";

const UserFilterPopup = () => {
    /* ===== CONTEXTS ===== */

    // add message function from message context
    const { addMessage } = useContext(MessageContext);

    /* ===== STATES ===== */
    const [users, setUsers] = useState(undefined);

    /* ===== FUNCTIONS ===== */

    // database functions
    const { queryProfileByList } = ProfileRead();

    // FUNCTION 1: fetchUsers - function that fetches any games that we are already fitering by
    // PRECONDITIONS (1 parameter):
    // 1.) searchParams: a URLSearchParams object which defines the filters on the recent submissions
    // POSTCONDITIONS (3 possible outcomes):
    // if any users are being filtered in the search params, and the query is a success, this function updates the `users` state by calling
    // the `setUsers` setter function
    // if any users are being filtered in the search params, and the query fails, this function will render an error message to the user,
    // and leave the component loading
    // if NO games are being filtered in the search params, this function will simply update the `users` state to an empty array by calling
    // the `setUsers()` setter function with an empty array argument
    const fetchUsers = async searchParams => {
        // first, let's get all the users from the search params, if there are any
        const ids = [];
        for (const [key, value] of searchParams) {
            if (key === "profile_id") {
                ids.push(value);
            }
        }

        // if there are any users in the search params, let's get all associated profile objects, and update the users state
        if (ids.length > 0) {
            try {
                const users = await queryProfileByList(ids);
                setUsers(users);
                console.log(users);
            } catch (error) {
                addMessage("There was a problem fetching user data.", "error");
            };
        }
        
        // otherwise, simply set users to an empty array
        else {
            setUsers([]);
        }
    };

    // FUNCTION 4: closePopup - code that simply closes the user filter popup
    // PRECONDITIONS (1 parameter):
    // 1.) setPopup: setter function that, when set to null, closes the popup
    // POSTCONDITIONS (1 possible outcome):
    // the popup is closed by calling the `setPopup` function with `false` as an argument
    const closePopup = setPopup => {
        setPopup(false);
    };

    return { users, fetchUsers, closePopup };
};

/* ===== EXPORTS ===== */
export default UserFilterPopup;