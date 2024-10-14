/* ===== IMPORTS ===== */
import { MessageContext, PopupContext } from "../../../utils/Contexts";
import { useContext, useState } from "react";

const GameFilter = (updateGlobalGames) => {
    /* ===== CONTEXTS ===== */

    // add message function from message context
    const { addMessage } = useContext(MessageContext);

    // close popup function from popup context
    const { closePopup } = useContext(PopupContext);

    /* ===== STATES ===== */
    const [games, setGames] = useState(undefined);
    const [versions, setVersions] = useState(undefined);
 
    /* ===== FUNCTIONS ===== */

    // FUNCTION 1: syncGames - code that is executed on component mount
    // PRECONDITIONS (1 parameter):
    // 1.) globalGames: an array containing the "global" set of games that we are filtering by
    // POSTCONDITIONS (1 possible outcome):
    // update our "local" state to be equivalent to the global state
    const syncGames = globalGames => {
        setGames(globalGames);
        const versions = {};
        globalGames.forEach(game => versions[game.abb] = "");
        setVersions(versions);
    };

    // FUNCTION 2: addGame - function that adds a game object to our games state
    // PRECONDITIONS (1 parameter):
    // 1.) game: an object containing information about a game
    // POSTCONDITIONS (2 possible outcomes):
    // if this is a "new" game, we add it to our array of games
    // otherwise, this function renders an error message to the user
    const addGame = game => {
        if (!(games.some(row => row.abb === game.abb))) {
            const updatedGames = games.concat([game]);
            setGames(updatedGames);
            setVersions({ ...versions, [game.abb]: "" });
        } else {
            addMessage("You are already filtering by this game.", "error", 6000);
        }
    };

    // FUNCTION 3: removeGame - function that removes a game object from our games state
    // PRECONDITIONS (1 parameter):
    // 1.) game: an object containing information about a game present in our array
    // POSTCONDITIONS (1 possible outcome):
    // the games state is updated with our games array with the game parameter filtered out
    const removeGame = game => {
        const updatedGames = games.filter(row => row.abb !== game.abb)
        setGames(updatedGames);
        const versionsCopy = { ...versions };
        delete versions[game.abb];
        setVersions(versionsCopy);
    };

    // FUNCTION 4: resetFilter - function that sets the `games` state back to an empty array, effectively resetting it
    // PRECONDIITONS: NONE
    // POSTCONDITIONS (1 possible outcome):
    // the `games` state is set to an empty array by calling the `setGames` setter function with an empty array as an argument
    const resetFilter = () => {
        setGames([]);
        setVersions({});
    };

    const updateVersion = e => {
        e.stopPropagation();
        const { id, value } = e.target;
        const abb = id.split("_")[0];
        setVersions({ ...versions, [abb]: value });
    };

    // FUNCTION 5: closePopupAndUpdate - function that closes the game filter popup, and updates the search params state
    // PRECONDITIONS (2 parameter):
    // 1.) searchParams: a URLSearchParams specifying the filters currently applied to the recent submissions page
    // 2.) setSearchParams: a setter function we can use to update the search params
    // POSTCONDITIONS (1 possible outcome):
    // any new games stored in the `games` array are added to a new URLSearchParams object, as well as any games that were already
    // present, and we update the searchParams state by calling the `setSearchParams` function. finally, the popup is closed by calling
    // the `closePopup` function
    const closePopupAndUpdate = (searchParams, setSearchParams) => {
        // first, let's update the searchParams state - must recreate searchParams, but without any games
        const newSearchParams = new URLSearchParams();
        for (const [key, value] of searchParams) {
            if (key !== "game_id") {
                newSearchParams.append(key, value);
            }
        };

        // now, let's add any games from the `games` state to our search params
        games.forEach(game => {
            newSearchParams.append("game_id", game.abb);
        });
        setSearchParams(newSearchParams);

        // finally, update global games state, and close popup
        updateGlobalGames(games);
        closePopup();
    };
    
    return { 
        games,
        versions,
        syncGames,
        addGame,
        removeGame,
        resetFilter,
        updateVersion,
        closePopupAndUpdate
    };
};

/* ===== EXPORTS ===== */
export default GameFilter;