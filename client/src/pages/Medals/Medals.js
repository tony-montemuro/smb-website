/* ===== IMPORTS ===== */
import { MessageContext } from "../../utils/Contexts";
import { useContext, useState } from "react";
import RPCRead from "../../database/read/RPCRead";

const Medals = () => {
    /* ===== CONTEXTS ===== */

    // add message function from message context
    const { addMessage } = useContext(MessageContext);

    /* ===== STATES ===== */
    const [medalTable, setMedalTable] = useState(undefined);

    /* ===== FUNCTIONS ===== */

    // database functions
    const { getMedals } = RPCRead();

    // FUNCTION 1: fetchMedals - given an abb, category & type, a medal table is generated
    // PRECONDITIONS (3 parameter):
    // 1.) abb: a string value, representing a game's abb value. this is used to uniquely identify it. abb is fetched from
    // the URL
    // 2.) category: the current category. category is fetched from the URL
    // 3.) type: the type of medal table, either "score" or "time". type is fetched from the URL 
    // POSTCONDITIONS (2 possible outcomes):
    // if the submission query is a success, an array of medals objects is queried, and the setMedals() function is called
    // to update the medals state with the medals array
    // if the getMedals query fails, an error message is rendered to the user, and the medal table state is NOT updated, 
    // leaving the Medals component stuck loading
    const fetchMedals = async (abb, category, type) => {
        // first, reset medal table state to undefined
        setMedalTable(undefined);

        try {
            // query database for the medals array
            const medals = await getMedals(abb, category, type);

            // update the medals state
            setMedalTable(medals);

        } catch (error) {
            // if the submissions fail to be fetched, let's render an error specifying the issue
			addMessage("Failed to fetch medal table data. If refreshing the page does not work, the database may be experiencing some issues.", "error");
        }
    };

    return { 
        medalTable,
        fetchMedals
    };
};

/* ===== EXPORTS ===== */
export default Medals;