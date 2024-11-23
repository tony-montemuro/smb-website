/* ===== IMPORTS ===== */
import { GameContext, MessageContext } from "../../utils/Contexts"; 
import { useContext, useState } from "react";
import GameHelper from "../../helper/GameHelper";
import RPCRead from "../../database/read/RPCRead";

const Totalizer = () => {
    /* ===== CONTEXTS ===== */

    // version state & set disable version dropdown function from game context
    const { version, setDisableVersionDropdown } = useContext(GameContext);

    // add message function from message context
    const { addMessage } = useContext(MessageContext);

    /* ===== STATES & REDUCERS ===== */
    const [totals, setTotals] = useState(undefined);

    /* ===== FUNCTIONS ===== */

    // database functions
    const { getTotals } = RPCRead();

    // helper functions
    const { getDecimals } = GameHelper();

    // FUNCTION 1: fetchTotals - given a game, category, & type, use the submissions to generate a totals object
    // PRECONDITIONS (3 parameters):
    // 1.) game: an object containing information about the game defined in the path
    // 2.) category: the current category. category is fetched from the URL
    // 3.) type: the type of medal table, either "score" or "time". type is fetched from the URL
    // POSTCONDITIONS (2 possible outcome):
    // if the submission query is successful, a totals object is created. totals has two fields, all and live. each of these fields 
    // is mapped to a totalizer array. once this object is generated, call the setTotals() function to update the totals state
    // if the submissions fail to be retrieved, an error message is rendered to the user, and the totals state is NOT updated, 
    // leaving the Totalizer component stuck loading
    const fetchTotals = async (game, category, type) => {
        // first, reset totals state to undefined
        setTotals(undefined);

        // then, attempt to query the database for the totals data: both for all submissions, and live-only submissions
        try {
            const promises = [false, true].map(liveOnly => {
                return getTotals(game.abb, category, type, liveOnly, version?.id);
            });
            const [all, live] = await Promise.all(promises);
            setTotals({ all, live });
        } catch (error) {
			addMessage("Failed to fetch totalizer data. If refreshing the page does not work, the system may be experiencing an outage.", "error", 10000);
        } finally {
            setDisableVersionDropdown(false);
        };
    };

    // TODO: this is a fine temporary solution, but should be generalized better - need to rework timer system!
    // FUNCTION 2: getDecimalsByCategory - given a game object and category, determine the decimals of the category
    // PRECONDITIONS (2 parameter):
    // 1.) game: an object containing information about the game defined in the path
    // 2.) category: a string value representing a valid category
    // POSTCONDITIONS (2 possible outcomes):
    // if even a single level exists with a `timer_type` ending in 'msec', we return 3
    // otherwise, return 2
    const getDecimalsByCategory = (game, category) => {
        const categoryLevels = game.mode.filter(mode => mode.category === category).map(mode => mode.level).flat(1);
        return getDecimals(categoryLevels);
    };

    return { totals, fetchTotals, getDecimalsByCategory };
};

/* ===== EXPORTS ===== */
export default Totalizer;