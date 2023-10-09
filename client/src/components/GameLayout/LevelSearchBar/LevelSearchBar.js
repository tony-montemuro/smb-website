/* ===== IMPORTS ===== */
import { GameContext } from "../../../utils/Contexts";
import { useContext, useState } from "react";
import FrontendHelper from "../../../helper/FrontendHelper";
import GameHelper from "../../../helper/GameHelper";

const LevelSearchBar = () => {
    /* ===== CONTEXTS ===== */

    // game state from game context
    const { game } = useContext(GameContext);

    /* ===== HELPER FUNCTIONS ===== */
    const { cleanLevelName } = FrontendHelper();
    const { getGameCategories } = GameHelper();

    /* ===== VARIABLES ===== */
    const categories = getGameCategories(game);

    /* ===== STATES ===== */
    const [filtered, setFiltered] = useState(undefined);
    const [searchInput, setSearchInput] = useState("");

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
    // PRECONDITIONS: NONE
    // POSTCONDITIONS (2 possible outcomes):
    // if one or more elements exists in the object, `true` is returned
    // otherwise, `false` is returned
    const hasElements = () => {
        for (const category in filtered) {
            if (filtered[category].length > 0) {
                return true;
            }
        }
        return false;
    };

    return { filtered, searchInput, setSearchInput, handleFilter, hasElements };
};

/* ===== EXPORTS ===== */
export default LevelSearchBar;