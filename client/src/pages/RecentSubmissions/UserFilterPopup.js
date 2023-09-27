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

    // FUNCTION 2: addUser - function that adds a user object to our users state
    // PRECONDITIONS (1 parameter):
    // 1.) user: an object containing information about a user
    // POSTCONDITIONS (2 possible outcomes):
    // if this is a "new" user, we add it to our array of users
    // otherwise, this function renders an error message to the user
    const addUser = user => {
        if (!(users.some(row => row.id === user.id))) {
            setUsers(users.concat([user]));
        } else {
            addMessage("You have already added this user as a filter!", "error");
        }
    };

    // FUNCTION 3: removeUser - function that removes a user object from our `users` state
    // PRECONDITIONS (1 parameter):
    // 1.) user: an object containing information about a user present in our array
    // POSTCONDITIONS (1 possible outcome):
    // the `users` state is updated with our users array with the user parameter filtered out
    const removeUser = user => {
        setUsers(users.filter(row => row.id !== user.id));
    };

    // FUNCTION 4: resetFilter - function that sets the `users` state back to an empty array, effectively resetting it
    // PRECONDIITONS: NONE
    // POSTCONDITIONS (1 possible outcome):
    // the `users` state is set to an empty array by calling the `setUsers` setter function with an empty array as an argument
    const resetFilter = () => {
        setUsers([]);
    };

    // FUNCTION 5: closePopup - code that simply closes the user filter popup
    // PRECONDITIONS (1 parameter):
    // 1.) setPopup: setter function that, when set to false, closes the popup
    // POSTCONDITIONS (1 possible outcome):
    // the popup is closed by calling the `setPopup` function with `false` as an argument
    const closePopup = setPopup => {
        setPopup(false);
    };

    // FUNCTION 6: closePopupAndUpdate - function that closes the user filter popup, and updates the search params state
    // PRECONDITIONS (3 parameters):
    // 1.) setPopup: a setter function that, when set to false, will close the popup
    // 2.) searchParams: a URLSearchParams specifying the filters currently applied to the recent submissions page
    // 3.) setSearchParams: a setter function we can use to update the search params
    // POSTCONDITIONS (1 possible outcome):
    // any new users stored in the `users` array are added to a new URLSearchParams object, as well as any users that were already
    // present, and we update the searchParams state by calling the `setSearchParams` function. finally, the popup is closed by calling
    // the `setPopup` function
    const closePopupAndUpdate = (setPopup, searchParams, setSearchParams) => {
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

        // finally, let's update states
        setSearchParams(newSearchParams);
        setPopup(false);
    };

    return { users, fetchUsers, addUser, removeUser, resetFilter, closePopup, closePopupAndUpdate };
};

/* ===== EXPORTS ===== */
export default UserFilterPopup;