/* ===== IMPORTS ===== */
import { useNavigate } from "react-router-dom";

const Game = () => {
    /* ===== VARIABLES ===== */
    const navigate = useNavigate();

    /* ===== FUNCTIONS ===== */

    // FUNCTION 1: onLevelClick - function that is called when the user clicks a button to navigate to a levelboard
    // 1.) abb: a string representing the unique identifier for a game
    // 2.) category: a string representing a valid category
    // 3.) type: a string, either "score" or "time"
    // 4.) levelName: a string representing the name of a level belonging to abb's game
    // POSTCONDITIONS (1 possible outcome):
    // the user will be navigated to the levelboard according to the parameters passed to the function
    const onLevelClick = (abb, category, type, levelName) => {
        navigate(`/games/${ abb }/${ category }/${ type }/${ levelName }`);
    };

    return { onLevelClick };
};

/* ===== EXPORTS ===== */
export default Game;