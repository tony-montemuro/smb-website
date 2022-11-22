import { useState } from "react";
import { supabase } from "../../components/SupabaseClient/SupabaseClient";
import { useNavigate } from "react-router-dom";

const UserStatsInit = () => {
    // variables
    const path = window.location.pathname;
    const pathArr = path.split("/");
    const userId = pathArr[2];
    const abb = pathArr[3];
    const navigate = useNavigate();

    // states
    const [loading, setLoading] = useState(true);
    const [validUser, setValidUser] = useState(false);
    const [validGame, setValidGame] = useState(false);
    const [title, setTitle] = useState(null);
    const [maxTime, setMaxTime] = useState(null);
    const [maxTimeMisc, setMaxTimeMisc] = useState(null);
    const [user, setUser] = useState(null);
    const [medals, setMedals] = useState([]);
    const [medalsMisc, setMedalsMisc] = useState([]);
    const [totals, setTotals] = useState([]);
    const [totalsMisc, setTotalsMisc] = useState([]);
    const [selectedRadioBtn, setSelectedRadioBtn] = useState("main");

    // function used to make sure a valid user is being viewed
    const checkForUser = async () => {
        try {
            // query for the user in the profiles table
            let { data: profile, error } = await supabase
                .from('profiles')
                .select('id, username, country, avatar_url')
                .eq("id", userId)
                .single();

            // if user is invalid, error will be thrown
            if (error) {
                throw error;
            }

            // if no error, update user and validUser hook
            setUser(profile);
            setValidUser(true);

        } catch (error) {
            // error code 22P02: userId is not in the uuid format, so it must be invalid
            // error code PGRST116: userId is not found in profiles table, so it must be invalid
            if (error.code === "22P02" || error.code === "PGRST116") {
                navigate("/");
            } else {
                console.log(error);
                alert(error.message);
            }
        }
    }

    // function used to check for valid game. if invalid, user will be redirected to home page
    const checkGame = async () => {
        try {
            // now, query the list of games, where we are searching for a match with the game abbreviation
            // in the url
            let { data: game, error } = await supabase
                .from("games")
                .select("*")
                .eq("abb", abb)
                .single();

            // if game is invalid, error will be thrown
            if (error) {
                throw error;
            }

            // if no error, update title, maxTime, maxTimeMisc, and validGame hooks
            setTitle(game.name);
            setMaxTime(game.time);
            setMaxTimeMisc(game.time_misc);
            setValidGame(true);

        } catch(error) {
            // error code PGRST116: abb is not found in games table, so it must be invalid
            if (error.code === "PGRST116") {
                navigate("/");
            } else {
                alert(error.message);
                console.log(error);
            } 
        }
        return false;
    }

    // helper function which simply checks for equality of medal sets. this will almost always return false
    const equalityCheck = (currSet, nextSet) => {
        return currSet.platinum === nextSet.platinum && currSet.gold === nextSet.gold && currSet.silver === nextSet.silver && currSet.bronze === nextSet.bronze;
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

    // function that will query the medal and totalizer tables based on the game and mode parameters
    const performQuery = async (game, mode) => {
        // initalize variables
        const isMisc = game.includes("misc");

        // First, query the medal table
        try {
            let { data: medalsList, error, status } = await supabase
                .from(`${game}_${mode}_medal_table`)
                .select(`
                    user_id,
                    profiles:user_id ( id, username, country, avatar_url ),
                    platinum,
                    gold,
                    silver,
                    bronze
                `)
                .order("platinum", { ascending: false })
                .order("gold", { ascending: false })
                .order("silver", { ascending: false })
                .order("bronze", { ascending: false });

            // if there was an error querying data, throw error
            if (error && status !== 406) {
                throw error;
            }

            // variables used to determine position of each submission
            let trueCount = 1;
            let posCount = trueCount;

            // now, iterate through each record, and calculate the position.
            // simplify each object. also, if the current user has a submission,
            // set the form values equal to the submission
            for (let i = 0; i < medalsList.length; i++) {
                const medalSet = medalsList[i];
                medalSet["Position"] = posCount;
                trueCount++;
                if (i < medalSet.length-1 && equalityCheck(medalSet, medalsList[i+1])) {
                    posCount = trueCount;
                }

                // simplify
                medalSet["Name"] = medalSet.profiles.username;
                medalSet["Country"] = medalSet.profiles.country;
                medalSet["Avatar_URL"] = medalSet.profiles.avatar_url;
                delete medalSet.profiles;
            }

            // finally, add the user's particular row into the medals state
            let userMedals = medalsList.find(item => item.user_id === userId);
            if (typeof userMedals === "undefined") {
                userMedals = {hasData: false};
            } else {
                userMedals.hasData = true;
            }
            userMedals.game = game;
            userMedals.mode = mode;
            game.includes("misc") ? setMedalsMisc(medalsMisc => [...medalsMisc, userMedals]) : setMedals(medals => [...medals, userMedals]);

        } catch (error) {
            console.log(error);
            alert(error.message);
        }

        // Now, query the totals table
        try {
            let { data: totals, status, error } = await supabase
                .from(`${game}_${mode}_total`)
                .select(`
                    user_id,
                    profiles:user_id ( id, username, country, avatar_url ),
                    total
                `)
                .order("total", mode === "score" ? { ascending: false } : { ascending: true });

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
                if (mode === "time") {
                    const [hours, minutes, seconds, centiseconds] = secondsToHours(total.total);
                    total["Hours"] = hours;
                    total["Minutes"] = minutes;
                    total["Seconds"] = seconds;
                    total["Centiseconds"] = centiseconds;
                }
            }

            // finally, add the user's particular total into the totals state
            let userTotal = totals.find(item => item.user_id === userId);
            if (typeof userTotal === "undefined") {
                userTotal = { hasData: false };
            } else {
                if (mode === "score") {
                    userTotal.hasData = userTotal.total !== 0 ? true : false;
                } else {
                    if (isMisc) {
                        userTotal.hasData = userTotal.total !== maxTimeMisc ? true : false;
                    } else {
                        userTotal.hasData = userTotal.total !== maxTime ? true : false;
                    }
                }
                
            }
            userTotal.game = game;
            userTotal.mode = mode;
            game.includes("misc") ? setTotalsMisc(totalsMisc => [...totalsMisc, userTotal]) : setTotals(totals => [...totals, userTotal]);

        } catch (error) {
            console.log(error);
            alert(error.message);
        }
    }

    // function that makes the calls to medal and total tables for each category
    const queryMedalsAndTotals = async () => {
        const games = [abb, `${abb}_misc`];
        const modes = ["score", "time"];
        for (const game of games) {
            for (const mode of modes) {
                performQuery(game, mode);
            }
        }
    }

    // function that will correctly sort either the medals or totals states, depending on the boolean
    // parameter 'isMedals'
    const sortData = async (isMedals, isMisc) => {
        // first, set up a temporary array based on the two boolean params
        let tempArr = new Array(2);
        let stateArr;
        if (isMisc) {
            stateArr = isMedals ? medalsMisc : totalsMisc;
        } else {
            stateArr = isMedals ? medals : totals;
        }

        // now, each two element array should have the following order: score, time
        for (const obj of stateArr) {
            if (obj.mode === "score") {
                tempArr[0] = obj
            } else {
                tempArr[1] = obj;
            }
        }

        // now, update the states based on the two boolean params
        if (isMisc) {
            isMedals ? setMedalsMisc(tempArr) : setTotalsMisc(tempArr);
        } else {
            isMedals ? setMedals(tempArr) : setTotals(tempArr);
        }
    }

    // function that will check the total for each category. if 0, set the hasData property of each
    // medalTable object equal to false
    const checkForData = () => {
        console.log(medals);
        console.log(medalsMisc);
        console.log(totals);
        console.log(totalsMisc);
    }

    // function used to check whether a radio button is selected or not
    const isRadioSelected = (val) => {
        return val === selectedRadioBtn;
    }

    // function that executes when a radio button is clicked
    const handleRadioClick = (e) => {
        console.log(e.target.value);
        setSelectedRadioBtn(e.target.value);
    }

    return { loading,
            validUser,
            validGame,
            title, 
            user, 
            medals, 
            totals, 
            medalsMisc, 
            totalsMisc,
            selectedRadioBtn,
            setLoading, 
            checkForUser,
            checkGame,
            queryMedalsAndTotals,
            sortData,
            checkForData,
            isRadioSelected,
            handleRadioClick };
}

export default UserStatsInit;