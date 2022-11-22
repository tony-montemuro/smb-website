import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../components/SupabaseClient/SupabaseClient";

const MedalsInit = () => {
    // states
    const [title, setTitle] = useState("");
    const [validPath, setValidPath] = useState(false);
    const [isMisc, setIsMisc] = useState(false);
    const [scoreMedals, setScoreMedals] = useState([]);
    const [timeMedals, setTimeMedals] = useState([]);

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

    // helper function which simply checks for equality of medal sets. this will almost always return false
    const equalityCheck = (currSet, nextSet) => {
        return currSet.platinum === nextSet.platinum && currSet.gold === nextSet.gold && currSet.silver === nextSet.silver && currSet.bronze === nextSet.bronze;
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

    // function that queries the medal table to get the list of medals
    const getMedalTable = async (isScore) => {
        const gameAbb = miscCheckAndUpdate(abb, "underline");

        try {
            // query the medal table for the particular game
            const mode = isScore ? "score" : "time";
            let { data: medalsList, status, error } = await supabase
                .from(`${gameAbb}_${mode}_medal_table`)
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
                if (i < medalsList.length-1 && !equalityCheck(medalSet, medalsList[i+1])) {
                    posCount = trueCount;
                }

                // simplify
                medalSet["Name"] = medalSet.profiles.username;
                medalSet["Country"] = medalSet.profiles.country;
                medalSet["Avatar_URL"] = medalSet.profiles.avatar_url;
                delete medalSet.profiles;
            }

            isScore ? setScoreMedals(medalsList) : setTimeMedals(medalsList);

            console.log(medalsList);
        } catch (error) {
            console.log(`${isScore ? "score" : "time"}`);
            console.log(error);
            alert(error.message);
        }
    }

    // function that simply returns the link back to the game's page
    const getLinkBack = () => {
        return `/games/${miscCheckAndUpdate(abb, "normalize")}`;
    }

    // function that allows user to navigate to the game's totalizer page
    const getLinkToTotals = () => {
        return `/games/${abb}/totalizer`;
    }

    return { title,
             validPath,
             isMisc, 
             scoreMedals,
             timeMedals,
             checkPath, 
             getMedalTable, 
             getLinkBack, 
             getLinkToTotals 
    };
}

export default MedalsInit;