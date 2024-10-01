/* ===== IMPORTS ===== */
import { MessageContext } from "../../utils/Contexts";
import { useContext, useState } from "react";
import { GameContext } from "../../utils/Contexts";
import RPCRead from "../../database/read/RPCRead";

const MedalTable = () => {
    /* ===== CONTEXTS ===== */

    // version state from game context
    const { version } = useContext(GameContext);

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

        // then, attempt to query the database for the medals data
        try {
            const medals = await getMedals(abb, category, type, version?.id);
            setMedalTable(medals);
        } catch (error) {
			addMessage("Failed to load medal table. If refreshing the page does not work, the system may be experiencing an outage.", "error", 10000);
        }
    };

    return { 
        medalTable,
        fetchMedals
    };
};

/* ===== EXPORTS ===== */
export default MedalTable;