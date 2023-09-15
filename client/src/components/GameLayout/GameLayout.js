/* ===== IMPORTS ===== */
import { MessageContext } from "../../utils/Contexts";
import { useContext } from "react";
import GameHelper from "../../helper/GameHelper";
import GameRead from "../../database/read/GameRead.js";

const GameLayout = () => {
    /* ===== CONTEXTS ===== */

    // add message function from message context
    const { addMessage } = useContext(MessageContext);

    /* ===== FUNCTIONS ===== */

    // database functions
    const { queryGame } = GameRead();

    // helper functions
    const { cleanGameObject } = GameHelper();

    // FUNCTION 1: fetchGame - code that is executed when the GameLayout component mounts, to fetch the desired game data
    // PRECONDITIONS (1 parameter):
    // 1.) abb: a string corresponding to the primary key of a game in the database
    // POSTCONDITIONS (2 possible outcomes):
    // if the query is successful, a game object is simply returned
    // if the query is unsuccessful, this function will render an error message to the screen, and return an undefined object,
    // leaving the `GameLayout` component stuck loading
    const fetchGame = async abb => {
        try {
            const game = await queryGame(abb);
            cleanGameObject(game);
            return game;

        } catch (error) {
            addMessage("There was an issue fetching this games data.", "error");
            return undefined;
        };
    };

    return { fetchGame };
};

/* ===== EXPORTS ===== */
export default GameLayout;