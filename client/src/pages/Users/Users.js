/* ===== IMPORTS ===== */
import { MessageContext } from "../../utils/Contexts";
import { useContext, useRef, useState } from "react";
import ProfileRead from "../../database/read/ProfileRead";

const Users = () => {
    /* ===== VARIABLES ===== */
    const USERS_PER_PAGE = 10;

    /* ===== REFS ===== */
    const searchRef = useRef(null);
    
    /* ===== CONTEXTS ===== */

    // add message function from message context
    const { addMessage } = useContext(MessageContext);

    /* ===== STATES ===== */
    const [users, setUsers] = useState({ data: undefined, total: 9999999999 }); // set total to some arbitrarily large number for now
    const [pageNum, setPageNum] = useState(1);
    const [forceUpdate, setForceUpdate] = useState(false);

    /* ===== FUNCTIONS ===== */

    // database functions
    const { searchForProfiles } = ProfileRead();

    // FUNCTION 1: getStartAndEnd - given the number of users & page number, retrieve the start and end item indicies
    // PRECONDITIONS (2 parameters):
    // 1.) itemsPerPage: an integer representing the max number of items that should exist on each page 
    // 2.) pageNumber: the page number the user is currently on
    // POSTCONDITIONS (2 possible returns, 1 possible outcome):
    // two variables are returned
    // a.) start: the index of the first item on the page
    // b.) end: the index of the last item on the page
    const getStartAndEnd = (itemsPerPage, pageNumber) => {
        const start = itemsPerPage*(pageNumber-1);
        const end = (itemsPerPage*pageNumber)-1;
        return { start, end };
    };

    // FUNCTION 2: updateResults - function that return all profiles whose username have a substring that matches userInput
    // PRECONDITIONS (1 parameter):
    // 1.) userInput: a string created by the user, which we attempt to "match" (via substring) to a username in the db
    // POSTCONDITIONS (2 possible outcomes):
    // if the query is a success, we use `profiles` and `count` to update the users state hook by calling the `setUsers()` function
    // if the query was a failure, simply render an error to the client
    const updateResults = async userInput => {
        // first, compute the range of users to grab based on the parameters
        const { start, end } = getStartAndEnd(USERS_PER_PAGE, pageNum);

        try {
            // attempt to grab all relevant profiles, and update the users state hook by calling the setUsers() function
            const { profiles, count } = await searchForProfiles(userInput, start, end);
            setUsers({ data: profiles, total: count });

        } catch (error) {
            // render an error message to the client
            addMessage("Profiles failed to load.", "error");
        }
    };

    // FUNCTION 3: resetPageNum - code that resets the pageNum state back to 1, and forces `updateResults` function to be called
    // PRECONDITIONS: NONE
    // POSTCONDITIONS (1 possible outcome):
    // this function will update two states: `pageNum` and `forceUpdate`. `pageNum` is set back to it's default value of 1, and
    // forceUpdate is toggled. this is a "hacky" way of forcing `updateResults` to be called every time this function is invoked
    const resetPageNum = () => {
        setPageNum(1);
        setForceUpdate(prev => !prev);
    };

    // FUNCTION 4: clearSearch - code that is executed when the user selects the "clear" button
    // PRECONDITIONS (2 parameters):
    // this function should only run if the search bar has content already in it
    // POSTCONDITIONS (1 possible outcome):
    // the search bar will be cleared, and the `handleFilter` function will be executed with an empty word, resetting the search
    // results back to all users
    const clearSearch = (usersPerPage, pageNumber) => {
        searchRef.current.value = "";
        updateResults("", usersPerPage, pageNumber);
    };

    return { 
        USERS_PER_PAGE, 
        searchRef, 
        users, 
        pageNum, 
        forceUpdate,
        setPageNum, 
        getStartAndEnd, 
        updateResults, 
        resetPageNum, 
        clearSearch 
    };
};

/* ===== EXPORTS ===== */
export default Users;