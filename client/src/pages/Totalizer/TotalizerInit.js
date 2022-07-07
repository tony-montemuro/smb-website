import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../components/SupabaseClient/SupabaseClient";
import Board from "./Board";

const TotalizerInit = () => {
    // states
    const [title, setTitle] = useState("");
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
            let approved = false;

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

    const getTotalizer = async (isScore) => {
        const gameAbb = miscCheckAndUpdate(abb, "underline");

        try {
            // query the score totalizer table for the particular game
            let { data: totals, status, error } = await supabase
                .from(`${gameAbb}_${isScore ? "score" : "time"}_total`)
                .select(`
                    user_id,
                    profiles:user_id ( id, username, country, avatar_url ),
                    total
                `)
                .order("total", { ascending: false });

            if (error && status !== 406) {
                throw error;
            }

            // now, clean up the data
            for (let i = 0; i < totals.length; i++) {
                const total = totals[i];
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

    const getLinkBack = () => {
        return `/games/${miscCheckAndUpdate(abb, "normalize")}`;
    }

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

    return { title, checkPath, getTotalizer, getLinkBack, TotalizerBoard };
}

export default TotalizerInit;