/* ===== IMPORTS ===== */
import { MessageContext } from "../../utils/Contexts";
import { useContext, useState } from "react";
import GameRead from "../../database/read/GameRead";
import GameProfileDelete from "../../database/delete/GameProfileDelete";
import GameProfileUpdate from "../../database/update/GameProfileUpdate";

const GameModerators = () => {
    /* ===== CONTEXTS ===== */

    // add message function from message context
    const { addMessage } = useContext(MessageContext);

    /* ===== STATES ===== */
    const [game, setGame] = useState(undefined);
    const [games, setGames] = useState(undefined);
    const [submitting, setSubmitting] = useState(false);

    /* ===== FUNCTIONS ===== */

    // database functions
    const { queryGamesForModerators } = GameRead();
    const { deleteModerator } = GameProfileDelete();
    const { insertModerator } = GameProfileUpdate();

    // FUNCTION 1: queryGames - code that is executed when the `GameModerators` component mounts, or when the game state is updated
    // PRECONDITIONS: NONE
    // POSTCONDITIONS (2 possible outcomes):
    // if the games are successfully queried, simply update the `game` & `games state by calling the `setGame` & `setGames` setter functions
    // if the games are unsuccessfully queried, render an error message, which should keep the component loading
    const queryGames = async () => {
        try {
            // attempt to fetch games data from db
            const games = await queryGamesForModerators();

            // update both the game and games states
            setGame(game ? games.find(row => row.abb === game.abb) : games[0]);
            setGames(games);

        } catch (error) {
            addMessage("There was an error fetching the moderator data for each game.", "error");
        };
    };

    // FUNCTION 2: removeModerator - code that is executed when the administrator requests to remove a moderator
    // PRECONDITIONS (2 parameters):
    // 1.) moderator: the moderator in question we wish to remove
    // 2.) setModerator: the setter function for the moderator state, which we use to close the delete popup
    // POSTCONDITIONS (2 possible outcomes):
    // if the moderator is successfully removed, render a success message, and close the popup
    // otherwise, keep the popup open, and render an error message to the user
    const removeModerator = async (moderator, setModerator) => {
        setSubmitting(true);
        try {
            await deleteModerator(game.abb, moderator.id);
            await queryGames();
            setModerator(null);
            addMessage("A moderator was successfully removed!", "success");
        } catch (error) {
            addMessage("There was an error trying to remove this moderator. Reloading the page is highly recommended.", "error");
        } finally {
            setSubmitting(false);
        };
    };

    // FUNCTION 3: addModerator - code that is executed when the administrator requests to add a moderator
    // PRECONDITIONS (2 parameters):
    // 1.) moderator: the moderator in question we wish to add
    // 2.) setModerator: the setter function for the moderator state, which we use to close the insert popup
    // POSTCONDITIONS (2 possible outcomes):
    // if the moderator is successfully added, render a success message, and close the popup
    // otherwise, keep the popup open, and render an error message to the user
    const addModerator = async (moderator, setModerator) => {
        setSubmitting(true);
        try {
            await insertModerator(game.abb, moderator.id);
            await queryGames();
            setModerator(null);
            addMessage("A moderator was successfully added!", "success");
        } catch (error) {
            if (error.code === "23505") {
                addMessage("This user is already a moderator for this game!", "error");
            } else {
                addMessage("There was an error trying to add this moderator. Reloading the page is highly recommended.", "error");   
            }
        } finally {
            setSubmitting(false);
        };
    };

    return { game, games, submitting, setGame, queryGames, removeModerator, addModerator };
};

/* ===== EXPORTS ===== */
export default GameModerators;