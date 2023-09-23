/* ===== IMPORTS ===== */
import { MessageContext } from "../../utils/Contexts";
import { useContext } from "react";
import GameProfileDelete from "../../database/delete/GameProfileDelete";

const GameModerators = (game) => {
    /* ===== CONTEXTS ===== */

    // add message function from message context
    const { addMessage } = useContext(MessageContext);

    /* ===== FUNCTIONS ===== */

    // database functions
    const { deleteModerator } = GameProfileDelete();

    // FUNCTION 1: removeModerator - code that is executed when the administrator requests to remove a moderator
    // PRECONDITIONS (2 parameters):
    // 1.) moderator: the moderator in question we wish to remove
    // 2.) setModerator: the setter function for the moderator state, which we use to close the delete popup
    // POSTCONDITIONS (2 possible outcomes):
    // if the moderator is successfully removed, render a success message, and close the popup
    // otherwise, keep the popup open, and render an error message to the user
    const removeModerator = async (moderator, setModerator) => {
        try {
            await deleteModerator(game.abb, moderator.id);
            setModerator(null);
            addMessage("A moderator was successfully removed!", "success");
        } catch (error) {
            addMessage("There was an error trying to remove this moderator.", "error");
        };
    };

    return { removeModerator };
};

/* ===== EXPORTS ===== */
export default GameModerators;