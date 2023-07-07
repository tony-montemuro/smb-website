/* ===== IMPORTS ===== */
import { StaticCacheContext } from "../../utils/Contexts";
import { useContext, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import FrontendHelper from "../../helper/FrontendHelper";

const SearchBar = abb => {
    /* ===== CONTEXTS ===== */

    // static cache state from static cache context
    const { staticCache } = useContext(StaticCacheContext);

    /* ===== VARIABLES ===== */
    const game = staticCache.games.find(row => row.abb === abb);
    const navigate = useNavigate();

    /* ===== REFS ===== */
    const searchRef = useRef(null);

    /* ===== STATES ===== */
    const [filtered, setFiltered] = useState([]);

    /* ===== FUNCTIONS ===== */

    // helper functions
    const { cleanLevelName } = FrontendHelper();

    // FUNCTION 1: handleFilter - given a word, find all level names that could be results
    // PRECONDITIONS (1 parameter):
    // 1.) word: a string value, representing a users search. formatted using typical english. this also includes a blank
    // string
    // POSTCONDITIONS (1 possible outcome):
    // we start with an empty array. for the current game, the levels objects of each mode object are searched. 
    // if a match is found, it is pushed into the array. once each level has been searched, the setFiltered() function
    // is run to update the filtered state array with our new array of filtered elements
    const handleFilter = word => {
        if (word.length > 0) {
            const newFilter = game.mode.map(mode => {   // for each mode
                return mode.level.filter(level => {     // for each level
                    return cleanLevelName(level.name).toLowerCase().includes(word.toLowerCase());
                });
            }).flat();
            setFiltered(newFilter);
        } else {
            setFiltered([]);
        }
    };

    // FUNCTION 2: clearSearch - clear the search bar
    // PRECONDITIONS:
    // this function can only be run if the search bar currently has any text stored inside of it
    // POSTCONDITIONS (1 possible outcome):
    // the searchRef's current value is set equal to an empty string, and the handleFilter function is called, with the word
    // parameter set to an empty string. this should totally reset the searchbar component
    const clearSearch = () => {
        searchRef.current.value = "";
        handleFilter("");
    };

    // FUNCTION 3: onResultClick - function that is called when the user clicks a search result
    // PRECONDITIONS (4 parameters):
    // 1.) abb: a string representing the unique identifier for a game
    // 2.) category: a string, either "main" or "misc"
    // 3.) type: a string, either "score" or "time"
    // 4.) levelName: a string representing the name of a level belonging to abb's game
    // POSTCONDITIONS (1 possible outcome):
    // the user is navigated to the levelboard given the parameters, and the search is cleared
    const onResultClick = (abb, category, type, levelName) => {
        navigate(`/games/${ abb }/${ category }/${ type }/${ levelName }`);
        clearSearch();
    };

    return { searchRef, filtered, handleFilter, clearSearch, onResultClick };
};

/* ===== EXPORTS ===== */
export default SearchBar;