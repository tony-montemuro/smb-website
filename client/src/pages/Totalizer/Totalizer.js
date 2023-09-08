/* ===== IMPORTS ===== */
import { MessageContext } from "../../utils/Contexts"; 
import { useContext, useState } from "react";
import RPCRead from "../../database/read/RPCRead";

const Totalizer = () => {
    /* ===== CONTEXTS ===== */

    // add message function from message context
    const { addMessage } = useContext(MessageContext);

    /* ===== STATES & REDUCERS ===== */
    const [totals, setTotals] = useState(undefined);

    /* ===== FUNCTIONS ===== */

    // database functions
    const { getTotals } = RPCRead();

    // FUNCTION 2: fetchTotals - given a game, category, & type, use the submissions to generate a totals object
    // PRECONDITIONS (3 parameters):
    // 1.) game: an object containing information about the game defined in the path
    // 2.) category: the current category. category is fetched from the URL
    // 3.) type: the type of medal table, either "score" or "time". type is fetched from the URL
    // 4.) submissionCache: an object with two fields:
		// a.) cache: the cache object that actually stores the submission objects (state)
		// b.) setCache: the function used to update the cache
    // POSTCONDITIONS (2 possible outcome):
    // if the submission query is successful, a totals object is created. totals has two fields, all and live. each of these fields 
    // is mapped to a totalizer array. once this object is generated, call the setTotals() function to update the totals state
    // if the submissions fail to be retrieved, an error message is rendered to the user, and the totals state is NOT updated, 
    // leaving the Totalizer component stuck loading
    const fetchTotals = async (game, category, type) => {
        // first, reset totals state to default state (undefined), & compute the total time of the game
        setTotals(undefined);

        try {
            // get create our array of promises (we want to call `getTotals` for all submissions, and live-only submissions)
            const promises = [false, true].map(liveOnly => {
                return getTotals(game.abb, category, type, liveOnly);
            });
            const [all, live] = await Promise.all(promises);
            
            // create a totals object that stores both arrays, and update totals object by calling setTotals()
            setTotals({ all, live });

        } catch (error) {
            // if the submissions fail to be fetched, let's render an error specifying the issue
			addMessage("Failed to fetch totalizer data. If refreshing the page does not work, the database may be experiencing some issues.", "error");
        };
    };

    return { 
        totals,
        fetchTotals
    };
};

/* ===== EXPORTS ===== */
export default Totalizer;