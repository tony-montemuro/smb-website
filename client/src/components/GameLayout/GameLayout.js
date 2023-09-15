/* ===== IMPORTS ===== */
import { MessageContext } from "../../utils/Contexts";
import { useContext } from "react";
import GameRead from "../../database/read/GameRead.js";

const GameLayout = () => {
    /* ===== CONTEXTS ===== */

    // add message function from message context
    const { addMessage } = useContext(MessageContext);

    /* ===== FUNCTIONS ===== */

    // database functions
    const { queryGame } = GameRead();

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

            // first, handle the game <==> monkey relationship
            game.monkey = [];
            game.game_monkey.forEach(row => game.monkey.push(row.monkey));
            delete game.game_monkey;

            // next, handle the game <==> region relationship
            game.region = [];
            game.game_region.forEach(row => game.region.push(row.region));
            delete game.game_region;

            // next, handle the game <==> rule relationship
            game.rule = [];
            game.game_rule.forEach(row => game.rule.push(row.rule));
            delete game.game_rule;

            // finally, handle the game <==> platform relationship
            game.platform = [];
            game.game_platform.forEach(row => game.platform.push(row.platform));
            delete game.game_platform;

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