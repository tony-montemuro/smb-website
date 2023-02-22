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
    const { validateTotalizerPath, calculateTotalTime, getTotalMaps, sortTotals, insertPositionToTotals } = TotalizerHelper();
    const { getSubmissions } = SubmissionRead();

    // navigate used for redirecting
    const navigate = useNavigate();

    // function that validates the path and generates the totalizer
    const generateTotals = async (type, games, levels, submissionReducer) => {
        // first, check the path
        const currentGame = games.find(game => game.abb === abb);
        const pathError = validateTotalizerPath(currentGame);

        // if the game is not valid, let's navigate home and end the function
        if (pathError) {
            console.log(pathError);
            navigate("/");
            return;
        }

        // update game hook, and get the total time (when type is time)
        setGame({ ...currentGame, is_misc: isMisc });
        const totalTime = calculateTotalTime(levels, abb, isMisc, type);

        // get submissions, and create two maps from the query: the { type } totals for only live records,
        // and the { type } totals for all records. (key: user_id -> value: total object)
        const submissions = await getSubmissions(abb, category, type, submissionReducer);
        const { allTotalsMap, liveTotalsMap } = getTotalMaps(submissions, type, totalTime);

        // from our maps, let's get a sorted list of totals objects sorted by total field. if the type is score, it will sort in descending order.
        // if the type is time, it will sort in ascending order
        const { liveTotals, allTotals } = sortTotals(allTotalsMap, liveTotalsMap, type);

        // add position field to each element in the list of objects
        insertPositionToTotals(allTotals, type);
        insertPositionToTotals(liveTotals, type);

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