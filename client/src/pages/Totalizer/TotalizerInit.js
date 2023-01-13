import { useState, useReducer } from "react";
import { useNavigate } from "react-router-dom";
import SubmissionQuery from "../../helper/SubmissionQuery";
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
    const { createTotalMaps, addPositionToTotals } = TotalizerHelper();
    const { query } = SubmissionQuery();

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

        // from here, we have two cases. if user is accessing already cached submissions, we can fetch
        // this information from submissionState. Otherwise, we need to query, and set the submission state
        let submissions = {};
        if (submissionState.state && abb in submissionState.state) {
            submissions = [...submissionState.state[abb]];
        } else {
            submissions = await query(abb, type);
            submissionState.setState({ ...submissionState.state, [abb]: [...submissions] });
        }

        // using our submission data, we need to create two lists from the query: the {mode} totals for only live records,
        // and the {mode} totals for all records. this for loop will also gather all unique profiles based on the submissions
        const filtered = submissions.filter(row => row.level.misc === isMisc);
        const { allTotalsMap, liveTotalsMap } = createTotalMaps(filtered, isMisc, type, timeTotal);

        // from our map, let's get a sorted list of profile objects sorted by total. if the type is score, it will sort in descending order.
        //  if the type is time, it will sort in ascending order
        let liveTotals = [], allTotals = [];
        if (type === "score") {
            liveTotals = Object.values(liveTotalsMap).sort((a, b) => a.total > b.total ? -1 : 1);
            allTotals = Object.values(allTotalsMap).sort((a, b) => a.total > b.total ? -1 : 1);
        } else {
            liveTotals = Object.values(liveTotalsMap).sort((a, b) => b.total > a.total ? -1 : 1);
            allTotals = Object.values(allTotalsMap).sort((a, b) => b.total > a.total ? -1 : 1);
        }
        
        // add position field to each element in list of objects
        addPositionToTotals(liveTotals, type === "time" ? true : false);
        addPositionToTotals(allTotals, type === "time" ? true : false);

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