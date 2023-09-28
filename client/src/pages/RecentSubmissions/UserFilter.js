/* ===== IMPORTS ===== */
import { MessageContext } from "../../utils/Contexts";
import { useContext } from "react";

const UserFilter = (users, dispatchFiltersData) => {
    /* ===== CONTEXTS ===== */

    // add message function from message context
    const { addMessage } = useContext(MessageContext);

    /* ===== FUNCTIONS ===== */

    // FUNCTION 1: addUser - function that adds a user object to our users state
    // PRECONDITIONS (1 parameter):
    // 1.) user: an object containing information about a user
    // POSTCONDITIONS (2 possible outcomes):
    // if this is a "new" user, we add it to our array of users
    // otherwise, this function renders an error message to the user
    const addUser = user => {
        if (!(users.some(row => row.id === user.id))) {
            dispatchFiltersData({ type: "users", value: users.concat([user]) });
        } else {
            addMessage("You have already added this user as a filter!", "error");
        }
    };

    // FUNCTION 2: removeUser - function that removes a user object from our `users` state
    // PRECONDITIONS (1 parameter):
    // 1.) user: an object containing information about a user present in our array
    // POSTCONDITIONS (1 possible outcome):
    // the `users` state is updated with our users array with the user parameter filtered out
    const removeUser = user => {
        dispatchFiltersData({ type: "users", value: users.filter(row => row.id !== user.id) });
    };

    // FUNCTION 3: resetFilter - function that sets the `users` state back to an empty array, effectively resetting it
    // PRECONDIITONS: NONE
    // POSTCONDITIONS (1 possible outcome):
    // the `users` state is set to an empty array by calling the `dispatchFiltersData` setter function with an empty array as an argument
    const resetFilter = () => {
        dispatchFiltersData({ type: "users", value: [] });
    };

    // FUNCTION 4: closePopupAndUpdate - function that closes the user filter popup, and updates the search params state
    // PRECONDITIONS (3 parameters):
    // 1.) closePopup: a function that, when called, will simply close the popup
    // 2.) searchParams: a URLSearchParams specifying the filters currently applied to the recent submissions page
    // 3.) setSearchParams: a setter function we can use to update the search params
    // POSTCONDITIONS (1 possible outcome):
    // any new users stored in the `users` array are added to a new URLSearchParams object, as well as any users that were already
    // present, and we update the searchParams state by calling the `setSearchParams` function. finally, the popup is closed by calling
    // the `closePopup` function
    const closePopupAndUpdate = (closePopup, searchParams, setSearchParams) => {
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

        // finally, let's update the search param state, and close the popup
        setSearchParams(newSearchParams);
        closePopup();
    };

    return { addUser, removeUser, resetFilter, closePopupAndUpdate };
};

/* ===== EXPORTS ===== */
export default UserFilter;