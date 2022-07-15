import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../components/SupabaseClient/SupabaseClient";

const SubmissionInit = () => {
    // states
    const [gameList, setGameList] = useState([]);
    const [submissions, setSubmissions] = useState({});

    // variables
    const navigate = useNavigate("/");

    // function used to check if current user is a mod
    const checkForMod = async () => {
        try {
            // initalize variables
            const userId = supabase.auth.user() ? supabase.auth.user().id : null;
            let isMod = false;

            const { data: mods, error, status } = await supabase
                .from("moderators")
                .select("user_id");

            if (error && status !== 406) {
                throw error;
            }

            // now, go through list of mods. if a match is detected with the current user, set state to true
            for (const mod of mods) {
               if (mod.user_id === userId) {
                isMod = true;
               } 
            }

            // if isMod is true, proceed. otherwise, navigate back to home
            isMod ? queryGames() : navHome();

        } catch (error) {
            alert(error.message);
        }
    }

    // function that is called if user is a moderator. once the list of games is queried, we can
    // query all the recent submissions for each game
    const queryGames = async () => {
        try {
            const { data: games, error, status } = await supabase
                .from("games")
                .select("abb, name, is_custom");

            if (error && status !== 406) {
                throw error;
            }

            setGameList(games);
            queryRecentSubmissions(games);
        } catch (error) {
            alert(error.message);
        }
    }

    const querySubmissions = async (game) => {
        try {
            const { data, error, status } = await supabase
                .from(`${game.abb}_recent_submissions`)
                .select(
                    "created_at",
                    "profiles:user_id ( username, country )",
                    "level_name",
                    "level_id",
                    "record",
                    "isScore",
                    "isMisc",
                    "proof",
                    "comment"
                )
                .order("created_at");

            if (error && status !== 406) {
                throw error;
            }

            // now, we need to clean the data up
            for (let i = 0; i < data.length; i++) {
                let submission = data[i];
                
                // simplify
                submission.username = submission.profiles.username;
                submission.country = submission.profiles.country;
                delete submission.profiles;

                // since record is stored as a float, if the current submission is a score, we need to parse to
                // integer type. otherwise, we need to fix the submission to two decimal places
                const record = submission.record;
                submission.record = submission.isScore ? parseInt(record) : record.toFixed(2);
                delete submission.isScore;
            }

            // finally, once the data has been cleaned, update the submissions state
            setSubmissions(submissions => ({...submissions, [game.abb]: data}));

        } catch (error) {
            alert(error.message);
        }
    }

    const queryRecentSubmissions = async (games) => {
        for (const game of games) {
           querySubmissions(game);
        }
    }

    // function that is called if user is not a moderator. this page is only allowed for mods
    const navHome = () => {
        navigate("/");
    }

    return { gameList, submissions, checkForMod };
}

export default SubmissionInit;