import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../components/SupabaseClient/SupabaseClient";
import Board from "./Board";

const TotalizerInit = () => {
    // states
    const [title, setTitle] = useState("");
    const [isMisc, setIsMisc] = useState(false);
    const [scoreTotals, setScoreTotals] = useState([]);
    const [timeTotals, setTimeTotals] = useState([]);

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
            // initalize variables
            let approved = false;
            if (abb.slice(-4) === "misc") {
                setIsMisc(true);
            }

            // now, query the list of games. if the current url matches any of these
            // it is an approved path
            let {data: games, error, status} = await supabase
                .from("games")
                .select("abb, name");

            // if there was an error querying data, throw error
            if (error && status !== 406) {
                throw error;
            }

            const correctedAbb = miscCheckAndUpdate(abb, "normalize")

            // now, iterate through game list, and compare with the current abb variable
            games.forEach(game => {
                const gameAbb = game.abb;
                const gameTitle = game.name;
                if (correctedAbb === gameAbb) {
                    approved = true;
                    setTitle(gameTitle);
                }
            });

            // if not approved, navigate back to home. otherwise, proceed.
            if (!approved) {
                navigate("/");
            }

        } catch(error) {
            alert(error.message);
        }
    }

    // function that queries the game's totalizer page to get list of totals
    const getTotalizer = async (isScore) => {
        const gameAbb = miscCheckAndUpdate(abb, "underline");

        try {
            // query the score totalizer table for the particular game
            const mode = isScore ? "score" : "time";
            let { data: totals, status, error } = await supabase
                .from(`${gameAbb}_${mode}_total`)
                .select(`
                    user_id,
                    profiles:user_id ( id, username, country, avatar_url ),
                    total
                `)
                .order("total", { ascending: false });

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
            }

            isScore ? setScoreTotals(totals) : setTimeTotals(totals);

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

    // totalizer board element
    const TotalizerBoard = ({ isScore }) => {
        return (
            <>
                {isScore ? 
                    <div className="totalizer-container">
                        <h2>Score Totals</h2>
                        <Board isScore={isScore} data={scoreTotals} />
                    </div>
                    : 
                    <div className="totalizer-container">
                        <h2>Time Totals</h2>
                        <Board isScore={isScore} data={timeTotals} />
                    </div>
                }
            </>
        );
    }

    return { title, isMisc, checkPath, getTotalizer, getLinkBack, getLinkToMedal, TotalizerBoard };
}

export default TotalizerInit;