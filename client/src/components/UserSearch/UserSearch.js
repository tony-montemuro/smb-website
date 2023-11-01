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
    const [badSearch, setBadSearch] = useState(null);

    /* ===== FUNCTIONS ===== */

    // database functions
    const { searchForProfiles } = ProfileRead();

    // helper functions
    const { getStartAndEnd } = PageControls();

    // FUNCTION 1: searchGames - function that will update search results if user input is valid
    // PRECONDITIONS (3 parameters):
    // 1.) userInput: a string created by the user, which we attempt to "match" (via substring) to a game name in the db
    // 2.) gamesPerPage: an integer that specifies the number of games that should render on each page
    // 3.) pageNum: an integer that specifies the page number the user is currently on
    // POSTCONDITIONS (2 possible outcomes):
    // if the search is "good" (has the potential to return results), the `updateResults` function is called
    // otherwise, this function does nothing
    const searchUsers = (userInput, gamesPerPage, pageNum) => {
        if (!badSearch || userInput.length < badSearch.length || !userInput.startsWith(badSearch)) {
            updateResults(userInput, gamesPerPage, pageNum);
        }
    };

    // FUNCTION 2: updateResults - function that return all profiles whose username have a substring that matches userInput
    // PRECONDITIONS (3 parameters):
    // 1.) userInput: a string created by the user, which we attempt to "match" (via substring) to a username in the db
    // 2.) usersPerPage: an integer that specifies the number of users that should render on each page
    // 3.) pageNum: an integer that specifies the page number the user is currently on
    // POSTCONDITIONS (2 possible outcomes):
    // if the query is a success, we use `profiles` and `count` to update the users state hook by calling the `setUsers()` function
    // if the query was a failure, simply render an error to the client
    const updateResults = async (userInput, usersPerPage, pageNum) => {
        // update states, and compute the start and end indicies
        setUsers(defaultUsers);
        setBadSearch(null);
        const { start, end } = getStartAndEnd(usersPerPage, pageNum);

        // attempt to query database for users
        try {
            const { profiles, count } = await searchForProfiles(userInput, start, end);
            setUsers({ data: profiles, total: count });
            if (profiles.length === 0) setBadSearch(badSearch => badSearch ? badSearch : userInput);
        } catch (error) {
            addMessage("Profiles failed to load.", "error");
        };
    };

    return { users, searchUsers };
};

/* ===== EXPORTS ===== */
export default UserSearch;