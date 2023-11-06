/* ===== IMPORTS ===== */
import { PopupContext, ToastContext } from "../../../utils/Contexts";
import { useContext } from "react";

const GameFilter = (games, dispatchFiltersData) => {
    /* ===== CONTEXTS ===== */

    // close popup function from popup context
    const { closePopup } = useContext(PopupContext);

    // add message function from toast context
    const { addMessage } = useContext(ToastContext);
 
    /* ===== FUNCTIONS ===== */

    // FUNCTION 1: addGame - function that adds a game object to our games state
    // PRECONDITIONS (1 parameter):
    // 1.) game: an object containing information about a game
    // POSTCONDITIONS (2 possible outcomes):
    // if this is a "new" game, we add it to our array of games
    // otherwise, this function renders an error message to the user
    const addGame = game => {
        if (!(games.some(row => row.abb === game.abb))) {
            dispatchFiltersData({ type: "games", value: games.concat([game]) });
        } else {
            addMessage("You are already filtering by this game.", "error", 6000);
        }
    };

    // FUNCTION 2: removeGame - function that removes a game object from our games state
    // PRECONDITIONS (1 parameter):
    // 1.) game: an object containing information about a game present in our array
    // POSTCONDITIONS (1 possible outcome):
    // the games state is updated with our games array with the game parameter filtered out
    const removeGame = game => {
        dispatchFiltersData({ type: "games", value: games.filter(row => row.abb !== game.abb) });
    };

    // FUNCTION 3: resetFilter - function that sets the `games` state back to an empty array, effectively resetting it
    // PRECONDIITONS: NONE
    // POSTCONDITIONS (1 possible outcome):
    // the `games` state is set to an empty array by calling the `dispatchFiltersData` setter function with an empty array as an argument
    const resetFilter = () => {
        dispatchFiltersData({ type: "games", value: [] });
    };

    // FUNCTION 4: closePopupAndUpdate - function that closes the game filter popup, and updates the search params state
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

        // now, let's add any games from the `games` state
        games.forEach(game => {
            newSearchParams.append("game_id", game.abb);
        });

        // finally, let's update the search params state, and close the popup
        setSearchParams(newSearchParams);
        closePopup();
    };
    
    return { addGame, removeGame, resetFilter, closePopupAndUpdate };
};

/* ===== EXPORTS ===== */
export default GameFilter;