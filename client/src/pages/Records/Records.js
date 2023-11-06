/* ===== IMPORTS ===== */
import { ToastContext } from "../../utils/Contexts";
import { useContext, useState } from "react";
import RPCRead from "../../database/read/RPCRead";

const Records = () => {
    /* ===== CONTEXTS ===== */

    // add message function from toast context
    const { addMessage } = useContext(ToastContext);

    /* ===== STATES ===== */
    const [recordTable, setRecordTable] = useState(undefined);

    /* ===== FUNCTIONS ===== */

    // database functions
    const { getRecords } = RPCRead();

    // FUNCTION 1: fetchRecords - given a game, category, type, fetch submissions and create the record table
    // PRECONDITIONS (3 parameters):
    // 1.) game: an object containing information about the game defined in the path
    // 2.) category: the current category. category is fetched from the URL
    // 3.) type: the current type, either "time" or "score". type is fetched from the URL
    // POSTCONDITIONS (2 possible outcomes):
    // if the submission query is a success, a recordTable object is generated. records has two fields: all and live. each field maps
    // to a recordTable object. each recordTable object has a field for each mode belonging to { game }, { category }, and { type }
    // each field is mapped to an array of record objects, each of which has 3 fields: level, record, and profiles. once this object is
    // generated, call the setRecordTable() function to update the recordTable state
    // if the submissions fail to be retrieved, an error message is rendered to the user, and the record table state is NOT updated, 
    // leaving the Records component stuck loading
    const fetchRecords = async (game, category, type) => {
        // first, reset record table state to default value (undefined)
        setRecordTable(undefined);

        // then, attempt to query the database for the records data: both for all submissions, and live-only submissions
        try {
            const promises = [false, true].map(liveOnly => {
                return getRecords(game.abb, category, type, liveOnly);
            });
            const [all, live] = await Promise.all(promises);
            setRecordTable({ all, live });
        } catch (error) {
			addMessage("Failed to fetch world record data. If refreshing the page does not work, the system may be experiencing an outage.", "error", 10000);
        }
    };

    // FUNCTION 2: allGreater - given a mode and index, determine if the "all" record is better than the live record
    // PRECONDITIONS (2 parameters):
    // 1.) mode: a string representing one of the game modes
    // 2.) index: an integer representing the index of one of the levels within a mode
    // POSTCONDITIONS (2 possible outcomes):
    // if the allRecord is greater than liveRecord, true is returned
    // otherwise, false is returned
    const allGreater = (mode, index) => {
        const allRecord = recordTable.all[mode][index].record;
        const liveRecord = recordTable.live[mode][index].record;
        return allRecord > liveRecord;
    };

    // FUNCTION 3: numNotLive - determine how many non-live records exist for a particular game
    // PRECONDITIONS (1 condition):
    // recordTable has been defined
    // POSTCONDITIONS (1 return, 1 possible outcome):
    // 1.) num: an integer count of every record where the all record is greater than the live record is returned
    const numNotLive = () => {
        let num = 0;
        Object.keys(recordTable.all).forEach(mode => {
            const levels = recordTable.all[mode];
            for (let index = 0; index < levels.length; index++) {
                num += Number(allGreater(mode, index));
            }
        });
        return num;
    };

    return { 
        recordTable, 
        fetchRecords,
        allGreater,
        numNotLive
    };
};

/* ===== EXPORTS ===== */
export default Records;