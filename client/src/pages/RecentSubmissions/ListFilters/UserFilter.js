/* ===== IMPORTS ===== */
import { PopupContext, MessageContext } from "../../../utils/Contexts";
import { useContext, useState } from "react";

const UserFilter = (updateGlobalUsers) => {
    /* ===== CONTEXTS ===== */

    // close popup function from popup context
    const { closePopup } = useContext(PopupContext);

    // add message function from message context
    const { addMessage } = useContext(MessageContext);

    /* ===== STATES ===== */
    const [users, setUsers] = useState(undefined);

    /* ===== FUNCTIONS ===== */

    // FUNCTION 1: syncUsers - code that is executed on component mount
    // PRECONDITIONS (1 parameter):
    // 1.) globalUsers: an array containing the "global" set of games that we are filtering by
    // POSTCONDITIONS (1 possible outcome):
    // update our "local" state to be equivalent to the global state
    const syncUsers = globalUsers => setUsers(globalUsers);

    // FUNCTION 2: addUser - function that adds a user object to our users state
    // PRECONDITIONS (1 parameter):
    // 1.) user: an object containing information about a user
    // POSTCONDITIONS (2 possible outcomes):
    // if this is a "new" user, we add it to our array of users
    // otherwise, this function renders an error message to the user
    const addUser = user => {
        if (!(users.some(row => row.id === user.id))) {
            const updatedUsers = users.concat([user])
            setUsers(updatedUsers);
        } else {
            addMessage("You are already filtering by this user.", "error", 6000);
        }
    };

    // FUNCTION 3: removeUser - function that removes a user object from our `users` state
    // PRECONDITIONS (1 parameter):
    // 1.) user: an object containing information about a user present in our array
    // POSTCONDITIONS (1 possible outcome):
    // the `users` state is updated with our users array with the user parameter filtered out
    const removeUser = user => {
        const updatedUsers = users.filter(row => row.id !== user.id);
        setUsers(updatedUsers);
    };

    // FUNCTION 4: resetFilter - function that sets the `users` state back to an empty array, effectively resetting it
    // PRECONDIITONS: NONE
    // POSTCONDITIONS (1 possible outcome):
    // the `users` state is set to an empty array by calling the `setUsers` setter function with an empty array as an argument
    const resetFilter = () => {
        setUsers([]);
    };

    // FUNCTION 5: closePopupAndUpdate - function that closes the user filter popup, and updates the search params state
    // PRECONDITIONS (2 parameters):
    // 1.) searchParams: a URLSearchParams specifying the filters currently applied to the recent submissions page
    // 2.) setSearchParams: a setter function we can use to update the search params
    // POSTCONDITIONS (1 possible outcome):
    // any new users stored in the `users` array are added to a new URLSearchParams object, as well as any users that were already
    // present, and we update the searchParams state by calling the `setSearchParams` function. finally, the popup is closed by calling
    // the `closePopup` function
    const closePopupAndUpdate = (searchParams, setSearchParams) => {
        // first, let's update the searchParams state - must recreate searchParams, but without any users
        const newSearchParams = new URLSearchParams();
        for (const [key, value] of searchParams) {
            if (key !== "profile_id") {
                newSearchParams.append(key, value);
            }
        };

        // now, let's add any users from the `users` state
        users.forEach(user => {
            newSearchParams.append("profile_id", user.id);
        });
        setSearchParams(newSearchParams);

        // finally, let's update the global "users" state, and close the popup
        updateGlobalUsers(users);
        closePopup();
    };

    return { syncUsers, users, addUser, removeUser, resetFilter, closePopupAndUpdate };
};

/* ===== EXPORTS ===== */
export default UserFilter;