/* ===== IMPORTS ===== */
import { MessageContext } from "../../utils/Contexts";
import { useContext, useState } from "react";
import GameRead from "../../database/read/GameRead.js";
import PageControls from "../PageControls/PageControls.js";

const GameSearch = () => {
    /* ===== CONTEXTS ===== */

    // add message function from message context
    const { addMessage } = useContext(MessageContext);

    /* ===== STATES ===== */
    const [games, setGames] = useState({ data: undefined, total: 0 });

    /* ===== FUNCTIONS ===== */

    // database functions
    const { searchForGames } = GameRead();

    // helper functions
    const { getStartAndEnd } = PageControls();

    // FUNCTION 1: updateResults - function that return all games whose name have a substring that matches userInput
    // PRECONDITIONS (4 parameters):
    // 1.) userInput: a string created by the user, which we attempt to "match" (via substring) to a game name in the db
    // 2.) gamesPerPage: an integer that specifies the number of games that should render on each page
    // 3.) pageNum: an integer that specifies the page number the user is currently on
    // 4.) gameTypeFilter: a value which determines how the games should be filtered. can be 3 values: "main", "custom", or undefined
    // POSTCONDITIONS (2 possible outcomes):
    // if the query is a success, we use `games` and `count` to update the games state hook by calling the `setGames()` function
    // if the query was a failure, simply render an error to the client
    const updateResults = async (userInput, gamesPerPage, pageNum, gameTypeFilter) => {
        // first, compute the range of games to grab based on the parameters
        const { start, end } = getStartAndEnd(gamesPerPage, pageNum);

        try {
            // attempt to grab all relevant games, and update the users state hook by calling the setGames() function
            const { games, count } = await searchForGames(userInput, start, end, gameTypeFilter);
            setGames({ data: games, total: count });

        } catch (error) {
            // render an error message to the client
            addMessage("Game data failed to load.", "error");
        }
    };

    return { games, updateResults };
};

/* ===== EXPORTS ===== */
export default GameSearch;