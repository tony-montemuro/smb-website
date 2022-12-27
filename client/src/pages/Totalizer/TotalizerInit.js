import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../components/SupabaseClient/SupabaseClient";
import TotalizerHelper from "../../helper/TotalizerHelper";

const TotalizerInit = () => {
    // states
    const [game, setGame] = useState({ name: "", abb: "" });
    const [loading, setLoading] = useState(true);
    const [isMisc, setIsMisc] = useState(false);
    const [showAllScore, setShowAllScore] = useState(false);
    const [showAllTime, setShowAllTime] = useState(false);
    const [scoreTotals, setScoreTotals] = useState([]);
    const [allScoreTotals, setAllScoreTotals] = useState([]);
    const [timeTotals, setTimeTotals] = useState([]);
    const [allTimeTotals, setAllTimeTotals] = useState([]);

    // path variables
    const path = window.location.pathname;
    const abb = path.split("/")[2];
    const category = path.split("/")[3];

    // helper functions
    const { createTotalMaps, addPositionToTotals } = TotalizerHelper();

    // navigate used for redirecting
    const navigate = useNavigate();

    // this function is primarily used to get the total time for the game defined by abb. however, this function
    // also makes sure that the path is valid, and updates the title state and isMisc state
    const getTimeTotal = async () => {
        try {
            // query level table
            let { data: timeArr, status, error } = await supabase
                .from("level")
                .select(`
                    time, 
                    misc,
                    mode (game (name, abb)),
                    chart_type
                `)
                .eq("game", abb)

            // error checks
            if ((error && status === 406) || timeArr.length === 0) {
                throw error ? error : { code: 1, message: "Error: invalid game." };
            }

            // update states
            const miscStatus = category === "misc" ? true : false;
            setGame(timeArr[0].mode.game);
            setIsMisc(miscStatus);

            // now, calculate the total time
            let timeTotal = 0;
            timeArr.forEach(level => {
                if (level.misc === miscStatus && (level.chart_type === "both" || level.chart_type === "time")) {
                    timeTotal += level.time;
                }
            });

            // once we have this, we can query the submissions table
            totalsQuery(timeTotal);

        } catch (error) {
            if (error.code === 1) {
                console.log(error.message);
                navigate("/");
            } else {
                console.log(error);
                alert(error.message);
            }
        }
    };

    // this is the primary query done for this page. it queries all submissions for the game defined in abb
    // and determines the total time or score for each player based on the information recieved from the query
    // NOTE: this function is ran twice per page load: once for score totals, and once for time totals
    const totalsQuery = async (timeTotal) => {
        // initialize variables
        const type = timeTotal === undefined ? "score" : "time";
        const miscStatus = category === "misc" ? true : false;

        try {
            // query submissions table
            let { data: submissions, status, error } = await supabase
                .from(`${type}_submission`)
                .select(`
                    profiles:user_id ( id, username, country, avatar_url ),
                    level (misc),
                    ${type},
                    live
                `)
                .eq("game_id", abb)

            // error check
            if (error && status !== 406) {
                throw error;
            }

            // using our query data, we need to create two lists from the query:
            // the {mode} totals for only live records, and the {mode} totals
            // for all records. this for loop will also gather all unique profiles
            // based on the submissions
            const { allTotalsMap, liveTotalsMap } = createTotalMaps(submissions, miscStatus, type, timeTotal);

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

            // finally, update react states
            type === "score" ? setScoreTotals(liveTotals) : setTimeTotals(liveTotals);
            type === "score" ? setAllScoreTotals(allTotals) : setAllTimeTotals(allTotals);
            if (type === "time") {
                setLoading(false);
            }

            console.log(liveTotals);
            console.log(allTotals);

        } catch(error) {
            console.log(error);
            alert(error.message);
        }
    };

    return { 
        game,
        loading,
        isMisc, 
        showAllScore,
        showAllTime,
        scoreTotals,
        allScoreTotals,
        timeTotals,
        allTimeTotals,
        setShowAllScore,
        setShowAllTime,
        totalsQuery,
        getTimeTotal
    };
};

export default TotalizerInit;