/* ===== IMPORTS ===== */
import { ToastContext } from "../../utils/Contexts";
import { useContext, useState } from "react";
import GameRead from "../../database/read/GameRead";
import GameProfileDelete from "../../database/delete/GameProfileDelete";
import GameProfileUpdate from "../../database/update/GameProfileUpdate";
import ScrollHelper from "../../helper/ScrollHelper";
import StylesHelper from "../../helper/StylesHelper";

const GameModerators = () => {
    /* ===== CONTEXTS ===== */

    // add message function from toast context
    const { addToastMessage } = useContext(ToastContext);

    /* ===== STATES ===== */
    const [game, setGame] = useState(undefined);
    const [games, setGames] = useState(undefined);
    const [submitting, setSubmitting] = useState(false);

    /* ===== FUNCTIONS ===== */

    // database functions
    const { queryGamesForModerators } = GameRead();
    const { deleteModerator } = GameProfileDelete();
    const { insertModerator } = GameProfileUpdate();

    // helper functions
    const { scrollToId } = ScrollHelper();
    const { getNavbarHeight } = StylesHelper();

    // FUNCTION 1: queryGames - code that is executed when the `GameModerators` component mounts, or when the game state is updated
    // PRECONDITIONS: NONE
    // POSTCONDITIONS (2 possible outcomes):
    // if the games are successfully queried, simply update the `game` & `games state by calling the `setGame` & `setGames` setter functions
    // if the games are unsuccessfully queried, render an error message, which should keep the component loading
    const queryGames = async () => {
        try {
            const games = await queryGamesForModerators();
            setGame(game ? games.find(row => row.abb === game.abb) : games[0]);
            setGames(games);
        } catch (error) {
            addToastMessage("There was an error fetching the moderator data. If refreshing the page does not work, the system may be experiencing an outage.", "error", 10000);
        };
    };

    // FUNCTION 2: setGameAndScroll - code that is executed when the administrator selects a game
    // PRECONDITIONS (1 parameter):
    // 1.) game: a game object, which belongs to the game the user selected
    // POSTCONDITIONS (1 possible outcome):
    // the game state is updated, and the user is scrolled to the moderation editor
    const setGameAndScroll = game => {
        setGame(game);
        let tabsHeight = getNavbarHeight()/2;
        if (window.innerWidth <= 800) {
            tabsHeight *= 3;
        }
        scrollToId("content", tabsHeight);
    };

    // FUNCTION 3: removeModerator - code that is executed when the administrator requests to remove a moderator
    // PRECONDITIONS (2 parameters):
    // 1.) moderator: the moderator in question we wish to remove
    // 2.) closePopup: a function that, when called, closes the popup
    // POSTCONDITIONS (2 possible outcomes):
    // if the moderator is successfully removed, render a success message, and close the popup
    // otherwise, keep the popup open, and render an error message to the user
    const removeModerator = async (moderator, closePopup) => {
        setSubmitting(true);
        try {
            await deleteModerator(game.abb, moderator.id);
            await queryGames();
            addToastMessage("Moderator was successfully removed!", "success", 5000);
            closePopup();
        } catch (error) {
            addToastMessage("There was an error trying to remove this moderator. Refreshing the page is highly recommended.", "error", 8000);
        } finally {
            setSubmitting(false);
        };
    };

    // FUNCTION 4: addModerator - code that is executed when the administrator requests to add a moderator
    // PRECONDITIONS (2 parameters):
    // 1.) moderator: the moderator in question we wish to add
    // 2.) closePopup: a function that, when called, closes the popup
    // POSTCONDITIONS (2 possible outcomes):
    // if the moderator is successfully added, render a success message, and close the popup
    // otherwise, keep the popup open, and render an error message to the user
    const addModerator = async (moderator, closePopup) => {
        setSubmitting(true);
        try {
            await insertModerator(game.abb, moderator.id);
            await queryGames();
            addToastMessage("Moderator was successfully added!", "success", 5000);
            closePopup();
        } catch (error) {
            if (error.code === "23505") {
                addToastMessage("This user is already a moderator for this game!", "error", 5000);
            } else {
                addToastMessage("There was an error trying to add this moderator. Refreshing the page is highly recommended.", "error", 8000);   
            }
        } finally {
            setSubmitting(false);
        };
    };

    return { game, games, submitting, queryGames, setGameAndScroll, removeModerator, addModerator };
};

/* ===== EXPORTS ===== */
export default GameModerators;