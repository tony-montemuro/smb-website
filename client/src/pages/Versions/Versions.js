/* ===== IMPORTS ===== */
import { MessageContext } from "../../utils/Contexts";
import { useContext, useState } from "react";
import GameRead from "../../database/read/GameRead";

const Versions = () => {
    /* ===== CONTEXTS ===== */

    // add message function from message context
    const { addMessage } = useContext(MessageContext);

    /* ===== STATES ===== */
    const [game, setGame] = useState(undefined);
    const [games, setGames] = useState(undefined);

    /* ===== FUNCTIONS ===== */
    
    // database functions
    const { queryGamesForModerators } = GameRead();

    // FUNCTION 1: queryGames - code that is executed when the `Versions` component mounts
    // PRECONDITIONS: NONE
    // POSTCONDITIONS (2 possible outcomes):
    // if the games are successfully queried, simply update the `game` & `games` state by calling the `setGame` & `setGames` setter functions
    // if the games are unsuccessfully queried, render an error message, which should keep the component loading
    const queryGames = async () => {
        try {
            const games = await queryGamesForModerators();
            setGame(game ? games.find(row => row.abb === game.abb) : games[0]);
            setGames(games);
        } catch (error) {
            addMessage("There was an error fetching the moderator data. If refreshing the page does not work, the system may be experiencing an outage.", "error", 10000);
        };
    };

    return { game, games, setGame, queryGames };
};

/* ===== EXPORTS ===== */
export default Versions;