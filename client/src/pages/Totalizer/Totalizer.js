/* ===== IMPORTS ===== */
import { MessageContext } from "../../utils/Contexts"; 
import { useContext, useState } from "react";
import SubmissionRead from "../../database/read/SubmissionRead";
import TotalizerHelper from "../../helper/TotalizerHelper";

const Totalizer = () => {
    /* ===== CONTEXTS ===== */

    // add message function from message context
    const { addMessage } = useContext(MessageContext);

    /* ===== STATES & REDUCERS ===== */
    const [totals, setTotals] = useState(undefined);

    /* ===== FUNCTIONS ===== */

    // helper functions
    const { calculateTotalTime, getTotalMaps, sortTotals, insertPositionToTotals } = TotalizerHelper();
    const { getSubmissions } = SubmissionRead();

    // FUNCTION 1: generateTotalizer - given an array of submissions, a type, and a totalTime, generate two separate arrays that
    // collectively represent the totalizer for a submission type combination
    // PRECONDITIONS (3 parameters):
    // 1.) submissions: an array containing unfiltered submissions for a particular game. the submissions must be
    // ordered by type in descending order, then by level id in ascending order
    // 2.) type: a string, either "time" or "score"
    // 3.) totalTime: a floating point value that is the sum of each level with a time chart
    // POSTCONDITIONS (2 returns):
    // 1.) all: an array of totalizer objects, that considers both live and nonlive submissions, sorted in descending order
    // if { type } is score, and ascending order if { type } is time
    // 2.) live: an array of totalizer objects, that only considers live submissions, sorted in descending order if
    // { type } is score, and ascending order if { type } is time
    const generateTotalizer = (submissions, type, totalTime) => {
        // create two maps from the submissions: the { type } totals for only live records,
        // and the { type } totals for all records. (key: user_id -> value: total object)
        const { allTotalsMap, liveTotalsMap } = getTotalMaps(submissions, type, totalTime);

        // from our maps, let's get a sorted list of totals objects sorted by total field. if the type is score, it will sort in descending order.
        // if the type is time, it will sort in ascending order
        const { liveTotals, allTotals } = sortTotals(allTotalsMap, liveTotalsMap, type);

        // add position field to each element in the list of objects
        insertPositionToTotals(allTotals, type);
        insertPositionToTotals(liveTotals, type);

        // finally, return both totalizer arrays
        return { all: allTotals, live: liveTotals };
    };

    // FUNCTION 2: fetchTotals - given a game, category, & type, use the submissions to generate a totals object
    // PRECONDITIONS (3 parameters):
    // 1.) game: an object containing information about the game defined in the path
    // 2.) category: the current category. category is fetched from the URL
    // 3.) type: the type of medal table, either "score" or "time". type is fetched from the URL
    // 4.) submissionReducer: an object with two fields:
        // a.) reducer: the submission reducer itself (state)
        // b.) dispatchSubmissions: the reducer function used to update the reducer
    // POSTCONDITIONS (2 possible outcome):
    // if the submission query is successful, a totals object is generated. totals has two fields, all and live. each of these fields 
    // is mapped to a totalizer array. once this object is generated, call the setTotals() function to update the totals state
    // if the submissions fail to be retrieved, an error message is rendered to the user, and the totals state is NOT updated, 
    // leaving the Totalizer component stuck loading
    const fetchTotals = async (game, category, type, submissionReducer) => {
        // first, reset totals state to default state (undefined), & compute the total time of the game
        setTotals(undefined);
        const totalTime = calculateTotalTime(game, category);

        try {
            // get the { type } submissions that are a part of the { category } of { game.abb }
            const submissions = await getSubmissions(game.abb, category, type, submissionReducer);

            // generate totalizer object
            const { all, live } = generateTotalizer(submissions, type, totalTime);
            
            // update the totals state
            const totals = {
                all: all,
                live: live
            };
            setTotals(totals);

        } catch (error) {
            // if the submissions fail to be fetched, let's render an error specifying the issue
			addMessage("Failed to fetch submission data. If refreshing the page does not work, the database may be experiencing some issues.", "error");
        };
    };

    return { 
        totals,
        fetchTotals
    };
};

/* ===== EXPORTS ===== */
export default Totalizer;