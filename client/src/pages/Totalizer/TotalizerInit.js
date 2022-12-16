import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../components/SupabaseClient/SupabaseClient";

const TotalizerInit = () => {
    // states
    const [title, setTitle] = useState("");
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

    // navigate used for redirecting
    const navigate = useNavigate();

    // this function will take an input in seconds, and return the hours, minutes, seconds, and centiseconds
    // NOTE: these will be STRING values, since leading zeros will be added
    const secondsToHours = (timeInSec) => {
        let hours = 0, minutes = 0, seconds = 0, centiseconds = 0;

        // 3600 seconds in 1 hour
        while (timeInSec >= 3600) {
            timeInSec -= 3600;
            hours++;
        }

        // 60 seconds in 1 minute
        while (timeInSec >= 60) {
            timeInSec -= 60;
            minutes++;
        }

        // with the remaining time, we can calculate the number of seconds and centiseconds
        seconds = Math.floor(timeInSec);
        centiseconds = (timeInSec - seconds) * 100;

        // finally, convert to a specialized string, which will automatically append a leading 0 to single
        // digit units of time
        hours = hours.toLocaleString('en-US', { minimumIntegerDigits: 2, useGrouping: false });
        minutes = minutes.toLocaleString('en-US', { minimumIntegerDigits: 2, useGrouping: false });
        seconds = seconds.toLocaleString('en-US', { minimumIntegerDigits: 2, useGrouping: false });
        centiseconds = centiseconds.toLocaleString('en-US', { minimumIntegerDigits: 2, useGrouping: false });

        return [hours, minutes, seconds, centiseconds];
    }

    // function that will add the position field to each total object in the totals array
    const addPosition = (totals, isTime) => {
        // variables used to determine position of each submission
        let trueCount = 1;
        let posCount = trueCount;

        // now, iterate through each record, and calculate the position.
        for (let i = 0; i < totals.length; i++) {
            const total = totals[i];
            total["position"] = posCount;
            trueCount++;
            if (i < totals.length-1 && totals[i+1]["total"] !== total["total"]) {
                posCount = trueCount;
            }

            if (isTime) {
                const [hours, minutes, seconds, centiseconds] = secondsToHours(total.total);
                total["hours"] = hours;
                total["minutes"] = minutes;
                total["seconds"] = seconds;
                total["centiseconds"] = centiseconds;
            }
        }
    }

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
                    mode (game (name))
                `)
                .eq("game", abb)

            // error checks
            if ((error && status === 406) || timeArr.length === 0) {
                throw error ? error : { code: 1, message: "Error: invalid game." };
            }

            const miscStatus = category === "misc" ? true : false;
            if (category !== "main" && category !== "misc") {
                const error = { code: 1, message: "Error: invalid category." }
                throw error;
            }

            // update states
            setTitle(timeArr[0].mode.game.name);
            setIsMisc(miscStatus);

            // now, calculate the total time
            let timeTotal = 0;
            timeArr.forEach(level => {
                if (level.misc === miscStatus) {
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
    }

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
            const liveTotalsMap = {};
            const allTotalsMap = {};
            while (submissions.length > 0) {
                const submission = submissions.pop();
                if (submission.level.misc === miscStatus) {
                    // first, extract values from submission object
                    const userId = submission.profiles.id;
                    const value = type === "score" ? submission.score : -Math.abs(submission.time);
                    const name = submission.profiles.username;
                    const country = submission.profiles.country;
                    const avatar_url = submission.profiles.avatar_url;

                    // next, update the allTotals list
                    if (userId in allTotalsMap) {
                        allTotalsMap[userId]["total"] += value
                    } else {
                        allTotalsMap[userId] = { user_id: userId, name: name, country: country, avatar_url: avatar_url, total: type === "score" ? value : timeTotal + value };
                    }

                    // finally, update the liveTotals list
                    if (submission.live) {
                        if (userId in liveTotalsMap) {
                            liveTotalsMap[userId]["total"] += value
                        } else {
                            liveTotalsMap[userId] = { user_id: userId, name: name, country: country, avatar_url: avatar_url, total: type === "score" ? value : timeTotal + value };
                        }
                    }
                }
            }

            // from our map, let's get a sorted list of profile objects sorted by total. if the type is score, it will sort in descending order. if the type
            // is time, it will sort in ascending order
            const liveTotals = Object.values(liveTotalsMap).sort((a, b) => type === "score" ? (a.total > b.total) : (b.total > a.total) ? -1 : 1);
            const allTotals = Object.values(allTotalsMap).sort((a, b) => type === "score" ? (a.total > b.total) : (b.total > a.total) ? -1 : 1);
            
            // add position field to each element in list of objects
            addPosition(liveTotals, type === "time" ? true : false);
            addPosition(allTotals, type === "time" ? true : false);

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
    }

    // function that simply returns user back to the game page
    const getLinkBack = () => {
        return `/games/${abb}`;
    }

    // function that allows user to navigate to the game's medal table page
    const getLinkToMedal = () => {
        return `/games/${abb}/${category}/medals`;
    }

    return { title,
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
             getTimeTotal,
             getLinkBack, 
             getLinkToMedal 
    };
}

export default TotalizerInit;