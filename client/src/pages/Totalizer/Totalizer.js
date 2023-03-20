/* ===== IMPORTS ===== */
import { useState } from "react";
import SubmissionRead from "../../database/read/SubmissionRead";
import TotalizerHelper from "../../helper/TotalizerHelper";

const Totalizer = () => {
    /* ===== STATES & REDUCERS ===== */
    const [totals, setTotals] = useState(undefined);

    /* ===== FUNCTIONS ===== */

    // helper functions
    const { getTotalMaps, sortTotals, insertPositionToTotals } = TotalizerHelper();
    const { getSubmissions } = SubmissionRead();

    // FUNCTION 1: calculateTotalTime - calculate the sum of all times for every level in a game with a time chart
    // PRECONDITIONS (2 parameters):
    // 1.) game: an object containing information about the game defined in the path
    // 2.) isMisc: a boolean value. true when category is misc, false when category is main
    // POSTCONDITIONS (1 return):
    // 1.) total: a floating point value that is the sum of each level with a time chart
    const calculateTotalTime = (game, isMisc) => {
        // define a variable to store the total
        let total = 0;
        
        // for each game
        game.mode.forEach(mode => {

            // we only want to consider levels that are part of the category defined by the isMisc parameter
            if (mode.misc === isMisc) {

                // for each mode
                mode.level.forEach(level => {

                    // we only want to consider levels that have time charts
                    total += ["time", "both"].includes(level.chart_type) ? level.time : 0;
                });
            }
        });
        return total;
    };

    // FUNCTION 2: generateTotalizer - given an array of submissions, a type, and a totalTime, generate two separate arrays that
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

    // FUNCTION 3: fetchTotals - given a game and category, use the submissions to generate a totals object
    // PRECONDITIONS (3 parameters):
    // 1.) game: an object containing information about the game defined in the path
    // 2.) category: the current category, either "main" or "misc". category is fetched from the URL
    // 3.) submissionReducer: an object with two fields:
        // a.) reducer: the submission reducer itself (state)
        // b.) dispatchSubmissions: the reducer function used to update the reducer
    // POSTCONDITIONS (1 possible outcome):
    // 1.) total: a totals object is generated. totals has two fields, score and time. each of these fields is mapped to
    // another object, each with two more fields, all and live. each of these fields is mapped to a totalizer array
    // once this object is generated, call the setTotals() function to update the totals state
    const fetchTotals = async (game, category, submissionReducer) => {
        // first, let's compute the total time of the game
        const isMisc = category === "misc" ? true : false;
        const totalTime = calculateTotalTime(game, isMisc);

        // get both score and time submissions that are a part of the category
        const [scoreSubmissions, timeSubmissions] = await Promise.all(
            [
                getSubmissions(game.abb, category, "score", submissionReducer), 
                getSubmissions(game.abb, category, "time", submissionReducer)
            ]
        );

        // generate totalizer objects for both score and time submissions
        const { all: scoreAll, live: scoreLive } = generateTotalizer(scoreSubmissions, "score", totalTime);
        const { all: timeAll, live: timeLive } = generateTotalizer(timeSubmissions, "time", totalTime);
        
        // update the totals state
        const totals = {
            score: { all: scoreAll, live: scoreLive },
            time: { all: timeAll, live: timeLive }
        };
        setTotals(totals);
    };

    return { 
        totals,
        fetchTotals
    };
};

/* ===== EXPORTS ===== */
export default Totalizer;