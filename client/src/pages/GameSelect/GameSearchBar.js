/* ===== IMPORTS ===== */
import { StaticCacheContext } from "../../utils/Contexts";
import { useContext, useState } from "react";

const GameSearchBar = () => {
    /* ===== CONTEXTS ===== */

    // static cache state from static cache context
    const { staticCache } = useContext(StaticCacheContext);

    /* ===== STATES ===== */
    const [filtered, setFiltered] = useState({ main: [], custom: [] });
    const [searchInput, setSearchInput] = useState("");

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
        // first, define the new filtered object
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

    return { filtered, searchInput, setSearchInput, handleFilter };
};

/* ===== EXPORTS ===== */
export default GameSearchBar;