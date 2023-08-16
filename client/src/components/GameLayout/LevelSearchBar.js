/* ===== IMPORTS ===== */
import { StaticCacheContext } from "../../utils/Contexts";
import { useContext, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import FrontendHelper from "../../helper/FrontendHelper";
import GameHelper from "../../helper/GameHelper";

const LevelSearchBar = abb => {
    /* ===== CONTEXTS ===== */

    // static cache state from static cache context
    const { staticCache } = useContext(StaticCacheContext);

    /* ===== HELPER FUNCTIONS ===== */
    const { cleanLevelName } = FrontendHelper();
    const { getGameCategories } = GameHelper();

    /* ===== VARIABLES ===== */
    const game = staticCache.games.find(row => row.abb === abb);
    const categories = getGameCategories(game);
    const navigate = useNavigate();

    /* ===== REFS ===== */
    const searchRef = useRef(null);

    /* ===== STATES ===== */
    const [filtered, setFiltered] = useState(undefined);

    /* ===== FUNCTIONS ===== */

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
        const newFiltered = {};
        categories.forEach(category => newFiltered[category] = []);

        // if the word is defined, we add all levels whose name match the word parameter (add to the array that
        // matches the mode category)
        if (word.length > 0) {
            game.mode.forEach(mode => {                 // for each mode
                mode.level.forEach(level => {           // for each level
                    if (cleanLevelName(level.name).toLowerCase().includes(word.toLowerCase())) {
                        newFiltered[mode.category].push(level);
                    }
                });
            });
        }

        // finally, we update the filtered state by calling the setFiltered() function
        setFiltered(newFiltered);
    };

    // FUNCTION 2: hasElements - function that determines if the filtered object has any elements in it
    // PRECONDITIONS (1 condition):
    // this function should be run each time the LevelSearchBar component is rerendered, to determine if search results should render
    // POSTCONDITIONS (2 possible outcomes):
    // if one or more elements exists in the object, TRUE is returned
    // otherwise, FALSE is returned
    const hasElements = () => {
        for (const category in filtered) {
            if (filtered[category].length > 0) {
                return true;
            }
        }
        return false;
    };

    // FUNCTION 3: clearSearch - clear the search bar
    // PRECONDITIONS (1 condition):
    // this function can only be run if the search bar currently has any text stored inside of it
    // POSTCONDITIONS (1 possible outcome):
    // the searchRef's current value is set equal to an empty string, and the handleFilter function is called, with the word
    // parameter set to an empty string. this should totally reset the searchbarinput component
    const clearSearch = () => {
        searchRef.current.value = "";
        handleFilter("");
    };

    // FUNCTION 4: onResultClick - function that is called when the user clicks a search result
    // PRECONDITIONS (4 parameters):
    // 1.) abb: a string representing the unique identifier for a game
    // 2.) category: a string representing a valid category
    // 3.) type: a string, either "score" or "time"
    // 4.) levelName: a string representing the name of a level belonging to abb's game
    // POSTCONDITIONS (1 possible outcome):
    // the user is navigated to the levelboard given the parameters, and the search is cleared
    const onResultClick = (abb, category, type, levelName) => {
        navigate(`/games/${ abb }/${ category }/${ type }/${ levelName }`);
        clearSearch();
    };

    return { searchRef, filtered, handleFilter, hasElements, clearSearch, onResultClick };
};

/* ===== EXPORTS ===== */
export default LevelSearchBar;