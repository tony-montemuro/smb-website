/* ===== IMPORTS ===== */
import { StaticCacheContext } from "../../Contexts";
import { useNavigate } from "react-router-dom";
import { useContext, useState } from "react";

const Game = () => {
    /* ===== CONTEXTS ===== */

    // static cache state from static cache context
    const { staticCache } = useContext(StaticCacheContext);

    /* ===== VARIABLES ===== */

    // navigate variable used to navigate to home screen if error is detected
    const navigate = useNavigate();

    /* ===== STATES ===== */
    const [game, setGame] = useState(undefined);

    /* ===== FUNCTIONS ===== */

    // FUNCTION 1: fetchGame - given an abb, find the corresponding game object
    // PRECONDITIONS (1 parameter):
    // 1.) abb: a string value, representing a game's abb value. this is used to uniquely identify it. abb is fetched from
    // the URL
    // POSTCONDITIONS (2 possible outcome):
    // 1.) abb does not correspond to a game. in this case, the function will handle this error, navigate
    // the user back to the home screen, and return early [this is usually due to a undefined URL path]
    // 2.) abb does correspond to a game. in this game, we fetch the game object from cache, and call the setGame() function
    // to update the game state with the game object
    const fetchGame = abb => {
        const games = staticCache.games;
        const currentGame = games.find(row => row.abb === abb);
        if (!currentGame) {
            console.log("Error: Invalid game.");
            navigate("/");
            return;
        }
        setGame(currentGame);
    };
    
    return { game, fetchGame };
};

export default Game;