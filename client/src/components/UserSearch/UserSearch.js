/* ===== IMPORTS ===== */
import { MessageContext } from "../../utils/Contexts";
import { useContext, useState } from "react";
import PageControls from "../PageControls/PageControls.js";
import ProfileRead from "../../database/read/ProfileRead";

const UserSearch = () => {
    /* ===== VARIABLES ===== */
    const defaultUsers = { data: undefined, total: 0 };

    /* ===== CONTEXTS ===== */

    // add message function from message context
    const { addMessage } = useContext(MessageContext);

    /* ===== STATES ===== */
    const [users, setUsers] = useState(defaultUsers);

    /* ===== FUNCTIONS ===== */

    // database functions
    const { searchForProfiles } = ProfileRead();

    // helper functions
    const { getStartAndEnd } = PageControls();

    // FUNCTION 1: updateResults - function that return all profiles whose username have a substring that matches userInput
    // PRECONDITIONS (3 parameters):
    // 1.) userInput: a string created by the user, which we attempt to "match" (via substring) to a username in the db
    // 2.) usersPerPage: an integer that specifies the number of users that should render on each page
    // 3.) pageNum: an integer that specifies the page number the user is currently on
    // POSTCONDITIONS (2 possible outcomes):
    // if the query is a success, we use `profiles` and `count` to update the users state hook by calling the `setUsers()` function
    // if the query was a failure, simply render an error to the client
    const updateResults = async (userInput, usersPerPage, pageNum) => {
        setUsers(defaultUsers);
        const { start, end } = getStartAndEnd(usersPerPage, pageNum);

        try {
            const { profiles, count } = await searchForProfiles(userInput, start, end);
            setUsers({ data: profiles, total: count });
        } catch (error) {
            addMessage("Profiles failed to load.", "error");
        };
    };

    return { users, updateResults };
};

/* ===== EXPORTS ===== */
export default UserSearch;