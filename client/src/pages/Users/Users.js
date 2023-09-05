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
    // 1.) profiles - a sorted array of all profile objects
    // POSTCONDITIONS (1 posssible outcome):
    // both the `all` and `filtered` fields of the user state are set equal to `profiles`, by calling the setUsers() function
    const prepareUsers = profiles => {
        // then, we can update the users state
        setUsers({
            all: profiles,
            filtered: profiles
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

    return { searchRef, users, pageNum, setPageNum, prepareUsers, handleFilter, clearSearch };
};

/* ===== EXPORTS ===== */
export default Users;