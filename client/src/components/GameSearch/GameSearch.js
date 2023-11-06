/* ===== IMPORTS ===== */
import { MessageContext } from "../../utils/Contexts";
import { useContext, useState } from "react";
import GameRead from "../../database/read/GameRead.js";
import PageControls from "../PageControls/PageControls.js";

const GameSearch = () => {
    /* ===== VARIABLES ===== */
    const defaultGames = { data: undefined, total: 0 };

    /* ===== CONTEXTS ===== */

    // add message function from message context
    const { addMessage } = useContext(MessageContext);

    /* ===== STATES ===== */
    const [games, setGames] = useState(defaultGames);
    const [badSearch, setBadSearch] = useState(null);

    /* ===== FUNCTIONS ===== */

    // database functions
    const { searchForGames } = GameRead();

    // helper functions
    const { getStartAndEnd } = PageControls();

    // FUNCTION 1: searchGames - function that will update search results if user input is valid
    // PRECONDITIONS (4 parameters):
    // 1.) userInput: a string created by the user, which we attempt to "match" (via substring) to a game name in the db
    // 2.) gamesPerPage: an integer that specifies the number of games that should render on each page
    // 3.) pageNum: an integer that specifies the page number the user is currently on
    // 4.) gameTypeFilter: a value which determines how the games should be filtered. can be 3 values: "main", "custom", or undefined
    // POSTCONDITIONS (2 possible outcomes):
    // if the search is "good" (has the potential to return results), the `updateResults` function is called
    // otherwise, this function does nothing
    const searchGames = (userInput, gamesPerPage, pageNum, gameTypeFilter) => {
        if (!badSearch || userInput.length < badSearch.length || !userInput.startsWith(badSearch)) {
            updateResults(userInput, gamesPerPage, pageNum, gameTypeFilter);
        }
    };

    // FUNCTION 2: updateResults - function that return all games whose name have a substring that matches userInput
    // PRECONDITIONS (4 parameters):
    // 1.) userInput: a string created by the user, which we attempt to "match" (via substring) to a game name in the db
    // 2.) gamesPerPage: an integer that specifies the number of games that should render on each page
    // 3.) pageNum: an integer that specifies the page number the user is currently on
    // 4.) gameTypeFilter: a value which determines how the games should be filtered. can be 3 values: "main", "custom", or undefined
    // POSTCONDITIONS (2 possible outcomes):
    // if the query is a success, we use `games` and `count` to update the games state hook by calling the `setGames()` function
    // if the query was a failure, simply render an error to the client
    const updateResults = async (userInput, gamesPerPage, pageNum, gameTypeFilter) => {
        // update states, and compute the start and end indicies
        setGames(defaultGames);
        setBadSearch(null);
        const { start, end } = getStartAndEnd(gamesPerPage, pageNum);

        // attempt to query database for games
        try {
            const { games, count } = await searchForGames(userInput, start, end, gameTypeFilter);
            setGames({ data: games, total: count });
            if (games.length === 0) setBadSearch(badSearch => badSearch ? badSearch : userInput);
        } catch (error) {
            addMessage("Games data failing to load.", "error", 6000);
        }
    };

    return { games, searchGames };
};

/* ===== EXPORTS ===== */
export default GameSearch;