/* ===== IMPORTS ===== */
import { StaticCacheContext } from "../../utils/Contexts";
import { useContext, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import FrontendHelper from "../../helper/FrontendHelper";

const LevelSearchBar = abb => {
    /* ===== CONTEXTS ===== */

    // static cache state from static cache context
    const { staticCache } = useContext(StaticCacheContext);

    /* ===== VARIABLES ===== */
    const game = staticCache.games.find(row => row.abb === abb);
    const navigate = useNavigate();

    /* ===== REFS ===== */
    const searchRef = useRef(null);

    /* ===== STATES ===== */
    const [filtered, setFiltered] = useState({ main: [], misc: [] });

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
        // define the new filtered object
        const newFiltered = { main: [], misc: [] };

        // if the word is defined, we add all levels whose name match the word parameter (add to the array that
        // matches whether or not the game is main or misc)
        if (word.length > 0) {
            game.mode.forEach(mode => {                 // for each mode
                mode.level.forEach(level => {           // for each level
                    if (cleanLevelName(level.name).toLowerCase().includes(word.toLowerCase())) {
                        mode.misc ? newFiltered.misc.push(level) : newFiltered.main.push(level);
                    }
                });
            });
        }

        // finally, we update the filtered state by calling the setFiltered() function
        setFiltered(newFiltered);
    };

    // FUNCTION 2: clearSearch - clear the search bar
    // PRECONDITIONS (1 condition):
    // this function can only be run if the search bar currently has any text stored inside of it
    // POSTCONDITIONS (1 possible outcome):
    // the searchRef's current value is set equal to an empty string, and the handleFilter function is called, with the word
    // parameter set to an empty string. this should totally reset the searchbarinput component
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
export default LevelSearchBar;