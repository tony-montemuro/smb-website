import { useState, useReducer } from "react";
import { useNavigate } from "react-router-dom";
import SubmissionRead from "../../database/read/SubmissionRead";
import TotalizerHelper from "../../helper/TotalizerHelper";

const TotalizerInit = () => {
    /* ===== VARIABLES ===== */
    const path = window.location.pathname;
    const abb = path.split("/")[2];
    const category = path.split("/")[3];
    const isMisc = category === "misc" ? true : false;

    /* ===== STATES & REDUCERS ===== */
    const [loading, setLoading] = useState(true);
    const [game, setGame] = useState({ name: "", abb: "", isMisc: isMisc });
    const [totals, dispatchTotals] = useReducer((state, action) => {
        return { 
            ...state,
            [action.type]: { all: action.allData, live: action.liveData }
        };
    }, { score: null, time: null });

    /* ===== FUNCTIONS ===== */

    // helper functions
    const { createTotalMaps, getTotalMaps, addPositionToTotals, insertPositionToTotals } = TotalizerHelper();
    const { retrieveSubmissions, newQuery } = SubmissionRead();

    // navigate used for redirecting
    const navigate = useNavigate();

    // function that validates the path and generates the totalizer
    const generateTotals = async (type, games, levels, submissionState) => {
        // first, check the path
        const currentGame = games.find(game => game.abb === abb);

        // if the game is not valid, let's navigate home and end the function
        if (!currentGame) {
            console.log("Error: Invalid game.");
            navigate("/");
            return;
        }

        // update game hook, and get the total time (when type is time)
        setGame({ ...currentGame, isMisc: isMisc });
        let timeTotal = 0;
        if (type === "time") {
            // first, filter level list by misc field & game
            const filtered = levels.filter(row => row.game === abb && row.misc === isMisc && ["time", "both"].includes(row.chart_type));

            // now, calculate total time
            filtered.forEach(level => {
                timeTotal += level.time;
            });
        }

        // get submissions, and filter based on the level.misc field
        const submissions = await retrieveSubmissions(abb, type, submissionState);
        const filtered = submissions.filter(row => row.level.misc === isMisc);

        // NEW - get submissions, and filter based on the level.misc field
        const newSubmissions = await newQuery(abb, type);
        const newFiltered = newSubmissions.filter(row => row.level.misc === isMisc);

        // using our submission data, we need to create two lists from the query: the { type } totals for only live records,
        // and the { type } totals for all records. this for loop will also gather all unique profiles based on the submissions
        const { allTotalsMap, liveTotalsMap } = createTotalMaps(filtered, isMisc, type, timeTotal);

        // NEW - using our submission data, we need to create two lists from the query: the { type } totals for only live records,
        // and the { type } totals for all records. this for loop will also gather all unique profiles based on the submissions
        const { newAllTotalsMap, newLiveTotalsMap } = getTotalMaps(newFiltered, type, timeTotal);

        // from our map, let's get a sorted list of profile objects sorted by total. if the type is score, it will sort in descending order.
        // if the type is time, it will sort in ascending order
        let liveTotals = [], allTotals = [];
        if (type === "score") {
            liveTotals = Object.values(liveTotalsMap).sort((a, b) => a.total > b.total ? -1 : 1);
            allTotals = Object.values(allTotalsMap).sort((a, b) => a.total > b.total ? -1 : 1);
        } else {
            liveTotals = Object.values(liveTotalsMap).sort((a, b) => b.total > a.total ? -1 : 1);
            allTotals = Object.values(allTotalsMap).sort((a, b) => b.total > a.total ? -1 : 1);
        }

        // NEW - from our map, let's get a sorted list of profile objects sorted by total. if the type is score, it will sort in descending order.
        // if the type is time, it will sort in ascending order
        let newLiveTotals = [], newAllTotals = [];
        if (type === "score") {
            newLiveTotals = Object.values(newLiveTotalsMap).sort((a, b) => a.total > b.total ? -1 : 1);
            newAllTotals = Object.values(newAllTotalsMap).sort((a, b) => a.total > b.total ? -1 : 1);
        } else {
            newLiveTotals = Object.values(newLiveTotalsMap).sort((a, b) => b.total > a.total ? -1 : 1);
            newAllTotals = Object.values(newAllTotalsMap).sort((a, b) => b.total > a.total ? -1 : 1);
        }
        
        // add position field to each element in list of objects
        addPositionToTotals(liveTotals, type === "time" ? true : false);
        addPositionToTotals(allTotals, type === "time" ? true : false);

        // NEW - add position field to each element in the list of objects
        insertPositionToTotals(newAllTotals, type);
        insertPositionToTotals(newLiveTotals, type);
        console.log(`${type} TOTALS GENERATED FROM NEW BACK-END:`);
        console.log({ all: allTotals, live: liveTotals });

        // finally, update react reducer
        dispatchTotals({ type: type, allData: allTotals, liveData: liveTotals });
    };

    return { 
        loading, 
        game,
        totals,
        setLoading,
        generateTotals
    };
};

export default TotalizerInit;