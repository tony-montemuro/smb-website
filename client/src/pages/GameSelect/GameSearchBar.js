/* ===== IMPORTS ===== */
import { StaticCacheContext } from "../../utils/Contexts";
import { useContext, useRef, useState } from "react";

const GameSearchBar = () => {
    /* ===== CONTEXTS ===== */

    // static cache state from static cache context
    const { staticCache } = useContext(StaticCacheContext);

    /* ===== REFS ===== */
    const searchRef = useRef(null);

    /* ===== STATES ===== */
    const [filtered, setFiltered] = useState({ main: [], custom: [] });

    /* ===== FUNCTIONS ===== */

    // FUNCTION 1: handleFilter - given a word, find all game names that could be results
    // PRECONDITIONS (1 parameter):
    // 1.) word: a string value, representing a users search. formatted using typical english. this also includes a blank
    // string
    // POSTCONDITIONS (2 possible outcome):
    // if the word is defined, we search through the array of games, looking for all games whose names match the word, and add each game
    // to it's respective array (main games in main array, custom games in custom array) 
    // if word is not defined, we simply set filtered back to it's default state
    const handleFilter = word => {
        // define the new filtered object
        const newFiltered = { main: [], custom: [] };

        // if the word is defined, we add all games whose name match the word parameter (add to the array that
        // matches whether or not the game is main or custom)
        if (word.length > 0) {
            staticCache.games.forEach(game => {
                if (game.name.toLowerCase().includes(word.toLowerCase())) {
                    game.custom ? newFiltered.custom.push(game) : newFiltered.main.push(game);
                }
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

    return { searchRef, filtered, handleFilter, clearSearch };
};

/* ===== EXPORTS ===== */
export default GameSearchBar;