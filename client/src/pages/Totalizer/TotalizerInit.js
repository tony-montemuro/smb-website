import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../components/SupabaseClient/SupabaseClient";

const TotalizerInit = () => {
    // states
    const [title, setTitle] = useState("");
    const [validPath, setValidPath] = useState(false);
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

    // navigate used for redirecting
    const navigate = useNavigate();

    // helper function that will check if game name ends with 'misc'. if so, it will return the string
    // with the misc sliced off. otherwise, str is simply returned.
    const miscCheckAndUpdate = (str, returnMode) => {
        if (str.slice(-4) === "misc") {
            if (returnMode === "normalize") {
                return str.slice(0, -4);
            }
            else if (returnMode === "underline") {
                return str.slice(0, -4) + "_" + str.slice(-4);
            }
            else {
                // just in-case
                return str.slice(0, -4);
            }
        } else {
            return str;
        }
    }

    // function that ensures user has navigated to a valid path. also used to grab the title of the game.
    const checkPath = async () => {
        try {
            // initialize variables, and update isMisc hook if game is miscellaneous
            const correctedAbb = miscCheckAndUpdate(abb, "normalize")
            if (abb.slice(-4) === "misc") {
                setIsMisc(true);
            }

            // now, query the list of games. if the current url matches any of these
            // it is an approved path
            let { data: game, error } = await supabase
                .from("games")
                .select("abb, name")
                .eq("abb", correctedAbb)
                .single();

            // if there was no match, an error will be thrown
            if (error) {
                throw error;
            }

            // if no error, then path is valid. update the title hook and validPath hook
            console.log(game.name);
            setTitle(game.name);
            setValidPath(true);

        } catch(error) {
            // error code PGRST116: correctedAbb is not found in games table, so it must be invalid
            if (error.code === "PGRST116") {
                navigate("/");
            } else {
                console.log(error);
                alert(error.message);
            }
        }
    }

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

    // function that queries the game's totalizer page to get list of totals
    const getTotalizer = async (isScore, isAll) => {
        const gameAbb = miscCheckAndUpdate(abb, "underline");
        const mode = isScore ? "score" : "time";
        const tableName = isAll ? `${gameAbb}_${mode}_total_all` : `${gameAbb}_${mode}_total`;

        try {
            // query the score totalizer table for the particular game
            let { data: totals, status, error } = await supabase
                .from(tableName)
                .select(`
                    user_id,
                    profiles:user_id ( id, username, country, avatar_url ),
                    total
                `)
                .order("total", isScore ? { ascending: false } : { ascending: true });

            if (error && status !== 406) {
                throw error;
            }

            // variables used to determine position of each submission
            let trueCount = 1;
            let posCount = trueCount;

            // now, iterate through each record, and calculate the position.
            // simplify each object. also, if the current user has a submission,
            // set the form values equal to the submission
            for (let i = 0; i < totals.length; i++) {
                const total = totals[i];
                total["Position"] = posCount;
                trueCount++;
                if (i < totals.length-1 && totals[i+1]["total"] !== total["total"]) {
                    posCount = trueCount;
                }

                // simplify
                total["Name"] = total.profiles.username;
                total["Country"] = total.profiles.country;
                total["Avatar_URL"] = total.profiles.avatar_url;
                delete totals[i].profiles;

                // finally, perform special calculation in the case of time
                if (!isScore) {
                    const [hours, minutes, seconds, centiseconds] = secondsToHours(total.total);
                    total["Hours"] = hours;
                    total["Minutes"] = minutes;
                    total["Seconds"] = seconds;
                    total["Centiseconds"] = centiseconds;
                }
            }

            if (isAll) {
                isScore ? setAllScoreTotals(totals) : setAllTimeTotals(totals);
            } else {
                isScore ? setScoreTotals(totals) : setTimeTotals(totals);
            }

            console.log(totals);
        } catch (error) {
            alert(error.message);
        }
    }

    // function that simply returns user back to the game page
    const getLinkBack = () => {
        return `/games/${miscCheckAndUpdate(abb, "normalize")}`;
    }

    // function that allows user to navigate to the game's medal table page
    const getLinkToMedal = () => {
        return `/games/${abb}/medals`;
    }

    return { title,
             validPath,
             isMisc, 
             showAllScore,
             showAllTime,
             scoreTotals,
             allScoreTotals,
             timeTotals,
             allTimeTotals,
             setShowAllScore,
             setShowAllTime,
             checkPath, 
             getTotalizer, 
             getLinkBack, 
             getLinkToMedal 
    };
}

export default TotalizerInit;