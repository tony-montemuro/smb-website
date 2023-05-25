/* ===== IMPORTS ===== */
import { MessageContext } from "../../Contexts";
import { useContext, useState } from "react";
import MedalsHelper from "../../helper/MedalsHelper";
import SubmissionRead from "../../database/read/SubmissionRead";

const Medals = () => {
    /* ===== CONTEXTS ===== */

    // add message function from message context
    const { addMessage } = useContext(MessageContext);

    /* ===== STATES ===== */
    const [medalTable, setMedalTable] = useState(undefined);

    /* ===== FUNCTIONS ===== */

    // helper functions
    const { getUserMap, getMedalTable, insertPositionToMedals } = MedalsHelper();
    const { getSubmissions } = SubmissionRead();

    // FUNCTION 1: generateMedalTable - given an array of submissions, create an array of medal table objects
    // PRECONDITIONS (1 parameter):
    // 1.) allSubmissions: an array containing unfiltered submissions for a particular game. the submissions must be
    // ordered by type in descending order, then by level id in ascending order
    // POSTCONDITIONS (1 possible outcome):
    // 1.) table: an array of medal table objects is returned. the array is sorted as follows (descending): 
    // platinum, gold, silver, bronze.
    const generateMedalTable = allSubmissions => {
        // filter submissions by the details.live field
        const submissions = allSubmissions.filter(row => row.details.live);

        // given our array of submissions, create the medal table
        const userMap = getUserMap(submissions);
        const table = getMedalTable(userMap, submissions);
        insertPositionToMedals(table);

        return table;
    }

    // FUNCTION 2: fetchMedals - given an abb, category & type, a medal table is generated
    // PRECONDITIONS (3 parameter):
    // 1.) abb: a string value, representing a game's abb value. this is used to uniquely identify it. abb is fetched from
    // the URL
    // 2.) category: the current category, either "main" or "misc". category is fetched from the URL
    // 3.) type: the type of medal table, either "score" or "time". type is fetched from the URL 
    // 4.) submissionReducer: an object with two fields:
        // a.) reducer: the submission reducer itself (state)
        // b.) dispatchSubmissions: the reducer function used to update the reducer
    // POSTCONDITIONS (2 possible outcomes):
    // if the submission query is a success, both the time and score medal tables are generated, and the setMedals() function is called
    // to update the medals state with the medalTable object. the medalTable object has two fields:
        // a.) score: this field stores the score medal table
        // b.) time: this field stores the time medal table
    // if the submissions fail to be retrieved, an error message is rendered to the user, and the medal table state is NOT updated, 
    // leaving the Medals component stuck loading
    const fetchMedals = async (abb, category, type, submissionReducer) => {
        // first, reset medal table state to undefined
        setMedalTable(undefined);

        try {
            // get all submissions, and filter based on the details.live field
            const allSubmissions = await getSubmissions(abb, category, type, submissionReducer);
            
            // generate medal table
            const table = generateMedalTable(allSubmissions);

            // update the medals state
            setMedalTable(table);

        } catch (error) {
            // if the submissions fail to be fetched, let's render an error specifying the issue
			addMessage("Failed to fetch submission data. If refreshing the page does not work, the database may be experiencing some issues.", "error");
        }
    };

    return { 
        medalTable,
        fetchMedals
    };
};

/* ===== EXPORTS ===== */
export default Medals;