/* ===== IMPORTS ===== */
import { MessageContext } from "../../utils/Contexts";
import { useContext, useState } from "react";
import GameRead from "../../database/read/GameRead";

const GameFilterPopup = () => {
    /* ===== CONTEXTS ===== */
    
    // add message function from message context
    const { addMessage } = useContext(MessageContext);

    /* ===== STATES ===== */
    const [games, setGames] = useState(undefined);

    /* ===== FUNCTIONS ===== */

    // database functions
    const { queryGameByList } = GameRead();

    // FUNCTION 1: fetchGames - function that fetches any games that we are already fitering by
    // PRECONDITIONS (1 parameter):
    // 1.) searchParams: a URLSearchParams object which defines the filters on the recent submissions
    // POSTCONDITIONS (3 possible outcomes):
    // if any games are being filtered in the search params, and the query is a success, this function updates the `games` state by calling
    // the `setGames` setter function
    // if any games are being filtered in the search params, and the query fails, this function will render an error message to the user,
    // and leave the component loading
    // if NO games are being filtered in the search params, this function will simply update the `games` state to an empty array by calling
    // the `setGames()` setter function with an empty array argument
    const fetchGames = async searchParams => {
        // first, let's get all the games from the search params, if there are any
        const abbs = [];
        for (const [key, value] of searchParams) {
            if (key === "game_id") {
                abbs.push(value);
            }
        }

        // if there are any games in the search params, let's get all associated game objects, and update the games state
        if (abbs.length > 0) {
            try {
                const games = await queryGameByList(abbs);
                setGames(games);
            } catch (error) {
                addMessage("There was a problem fetching game data.", "error");
            };
        }
        
        else {
            setGames([]);
        }
    };

    // FUNCTION 2: addGame - function that adds a game object to our games state
    // PRECONDITIONS (1 parameter):
    // 1.) game: an object containing information about a game that does not already exist in the array
    // POSTCONDITIONS (2 possible outcomes):
    // if this is a "new" game, we add it to our array of games
    // otherwise, this function renders an error message to the user
    const addGame = game => {
        if (!(games.some(row => row.abb === game.abb))) {
            setGames(games.concat([game]));
        } else {
            addMessage("You have already added this game as a filter!", "error");
        }
    };

    // FUNCTION 3: removeGame - function that removes a game object from our games state
    // PRECONDITIONS (1 parameter):
    // 1.) game: an object containing information about a game present in our array
    // POSTCONDITIONS (1 possible outcome):
    // the games state is updated with our games array with the game parameter filtered out
    const removeGame = game => {
        setGames(games.filter(row => row.abb !== game.abb));
    };

    // FUNCTION 4: closePopup - function that simply closes the popup
    // PRECONDITIONS (1 parameter):
    // 1.) setPopup: a setter function that, when set to false, will close the popup
    // POSTCONDITIONS (1 possible outcome):
    // the popup is closed by calling the `setPopup` function
    const closePopup = setPopup => {
        setPopup(false);
    };

    // FUNCTION 5: closePopupAndUpdate - function that closes the game filter popup, and updates the search params state
    // PRECONDITIONS (3 parameters):
    // 1.) setPopup: a setter function that, when set to false, will close the popup
    // 2.) searchParams: a URLSearchParams specifying the filters currently applied to the recent submissions page
    // 3.) setSearchParams: a setter function we can use to update the search params
    // POSTCONDITIONS (1 possible outcome):
    // any new games stored in the `games` array are added to a new URLSearchParams object, as well as any games that were already
    // present, and we update the searchParams state by calling the `setSearchParams` function. finally, the popup is closed by calling
    // the `setPopup` function
    const closePopupAndUpdate = (setPopup, searchParams, setSearchParams) => {
        // first, let's update the searchParams state - must recreate searchParams, but without any games
        const newSearchParams = new URLSearchParams();
        for (const [key, value] of searchParams) {
            if (key !== "game_id") {
                newSearchParams.append(key, value);
            }
        };

        // now, let's add any games from the `games` state
        games.forEach(game => {
            newSearchParams.append("game_id", game.abb);
        });

        // finally, let's update states
        setSearchParams(newSearchParams);
        setPopup(false);
    }
    
    return { games, fetchGames, addGame, removeGame, closePopup, closePopupAndUpdate };
};

/* ===== EXPORTS ===== */
export default GameFilterPopup;