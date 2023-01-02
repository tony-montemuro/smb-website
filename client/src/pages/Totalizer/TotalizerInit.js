import { useState, useReducer } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../components/SupabaseClient/SupabaseClient";
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

    // navigate used for redirecting
    const navigate = useNavigate();

    // this function is primarily used to get the total time for the game defined by abb. however, this function
    // also makes sure that the path is valid, and updates the game state
    const getGame = async () => {
        try {
            // query level table
            let { data: timeArr, status, error } = await supabase
                .from("level")
                .select(`
                    time, 
                    mode (game (name, abb))
                `)
                .eq("game", abb)
                .eq("misc", isMisc)
                .in("chart_type", ["both", "time"]);

            // error handling
            if ((error && status === 406) || timeArr.length === 0) {
                throw error ? error : { code: 1, message: "Error: invalid game." };
            }

            // now, calculate the total time
            let timeTotal = 0;
            timeArr.forEach(level => {
                timeTotal += level.time;
            });

            // update game state hook
            const gameObj = timeArr[0].mode.game;
            setGame({
                ...game,
                name: gameObj.name,
                abb: gameObj.abb,
                time: timeTotal
            });

        } catch (error) {
            if (error.code === 1) {
                console.log(error.message);
            } else {
                console.log(error);
                alert(error.message);
            }
            navigate("/");
        }
    };

    // this is the primary query done for this page. it queries all submissions for the game defined in abb
    // and determines the total time or score for each player based on the information recieved from the query
    // NOTE: this function is ran twice per page load: once for score totals, and once for time totals
    const totalsQuery = async (type) => {
        try {
            // query submissions table
            let { data: submissions, status, error } = await supabase
                .from(`${ type }_submission`)
                .select(`
                    profiles:user_id ( id, username, country, avatar_url ),
                    level (misc),
                    ${ type },
                    live
                `)
                .eq("game_id", abb)

            // error handling
            if (error && status !== 406) {
                throw error;
            }

            // using our query data, we need to create two lists from the query:
            // the {mode} totals for only live records, and the {mode} totals
            // for all records. this for loop will also gather all unique profiles
            // based on the submissions
            const { allTotalsMap, liveTotalsMap } = createTotalMaps(submissions, isMisc, type, game.time);

            // from our map, let's get a sorted list of profile objects sorted by total. if the type is score, it will sort in descending order. if the type
            // is time, it will sort in ascending order
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

            // console.log(type);
            // console.log(liveTotals);
            // console.log(allTotals);

        } catch(error) {
            console.log(error);
            alert(error.message);
        }
    };

    return { 
        loading, 
        game,
        totals,
        setLoading,
        getGame,
        totalsQuery
    };
};

export default TotalizerInit;