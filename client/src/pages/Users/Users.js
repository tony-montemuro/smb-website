/* ===== IMPORTS ===== */
import { useRef, useState } from "react";

const Users = () => {
    /* ===== REFS ===== */
    const searchRef = useRef(null);

    /* ===== STATES ===== */
    const [users, setUsers] = useState(undefined);
    const [pageNum, setPageNum] = useState(1);

    /* ===== FUNCTIONS ===== */

    // FUNCTION 1: prepareUsers - function that sets the users state with the appropriate data
    // PRECONDITIONS (1 parameter):
    // 1.) profiles - an array of all profile objects
    // POSTCONDITIONS (1 posssible outcome):
    // the users array is sorted in ascending order by the `username` field, and both the `all` and `filtered` fields of the
    // user state are set equal to this sorted array, by calling the setUsers() function
    const prepareUsers = profiles => {
        // first, sort users
        const sortedUsers = profiles.sort((a, b) => {
            // convert to lowercase
            const usernameA = a.username.toLowerCase();
            const usernameB = b.username.toLowerCase();

            // now, do comparisons
            if (usernameA < usernameB) {
                return -1;
            }
            if (usernameA > usernameB) {
                return 1;
            }
            return 0;
        });
        
        // then, we can update the users state
        setUsers({
            all: sortedUsers,
            filtered: sortedUsers
        });
    };

    // FUNCTION 2: handleFilter - function that filters the list of users each time the user updates the search form
    // PRECONDITIONS (1 parameter):
    // 1.) word: a string representing the user's input from the search form (can also be an empty string)
    // POSTCONDITIONS (2 possible outcomes):
    // if the word is a non-empty string, the "all" user list will be filtered according to the word parameter, and that value will
    // be used to updated the filtered user list
    // if the word is an empty string, the filtered user list is set back to the all user list
    const handleFilter = word => {
        let filtered = users.all;
        if (word.length > 0) {
            filtered = users.all.filter(user => {
                return user.username.toLowerCase().includes(word.toLowerCase());
            });
        };
        setUsers({ ...users, filtered: filtered });
        setPageNum(1);
    };

    // FUNCTION 3: clearSearch - code that is executed when the user selects the "clear" button
    // PRECONDITIONS (1 condition):
    // this function should only run if the search bar has content already in it
    // POSTCONDITIONS (1 possible outcome):
    // the search bar will be cleared, and the `handleFilter` function will be executed with an empty word, resetting the search
    // results back to all users
    const clearSearch = () => {
        searchRef.current.value = "";
        handleFilter("");
    };

    // FUNCTION 4: getStartAndEnd - given the number of users and page number, retrieve the start and end post indicies
    // PRECONDITIONS (1 parameters):
    // 1.) num: an integer representing the max number of users that should exist on each page 
    // POSTCONDITIONS (2 possible returns, 1 possible outcome):
    // two variables are returned
    // a.) start: the index of the first post on the page
    // b.) end: the index of the last post on the page
    const getStartAndEnd = num => {
        const start = Math.min(((num*(pageNum-1))+1), users.filtered.length);
        const end = Math.min((((num*pageNum)-1)+1), users.filtered.length);
        return { start: start, end: end };
    };

    // FUNCTION 5: getMaxPage - function that returns the max number of pages, given the total # of filtered users & number of users
    // per page
    // PRECONDITIONS (1 parameter):
    // 1.) num - an integer representing the number of users per page
    // POSTCONDITIONS (1 possible outcome):
    // using these two values, the max page number is returned (must be at least 1)
    const getMaxPage = num => {
        return Math.max(Math.ceil(users.filtered.length/num), 1);
    };

    return { searchRef, users, pageNum, setPageNum, prepareUsers, handleFilter, clearSearch, getStartAndEnd, getMaxPage };
};

/* ===== EXPORTS ===== */
export default Users;