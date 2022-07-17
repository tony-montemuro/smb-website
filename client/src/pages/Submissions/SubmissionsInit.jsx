import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../components/SupabaseClient/SupabaseClient";

const SubmissionInit = () => {
    // states
    const [loading, setLoading] = useState(true);
    const [gameList, setGameList] = useState([]);
    const [submissions, setSubmissions] = useState({});
    const [currentGame, setCurrentGame] = useState("smb1");

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
                .select("abb, name, is_custom")
                .order("is_custom")
                .order("name");

            if (error && status !== 406) {
                throw error;
            }

            setGameList(games);
            queryRecentSubmissions(games);
        } catch (error) {
            alert(error.message);
        }
    }

    // function that actually performs the query based on the game param
    const querySubmissions = async (game) => {
        try {
            const { data, error, status } = await supabase
                .from(`${game.abb}_recent_submissions`)
                .select(`
                    created_at,
                    profiles:user_id ( username, country ),
                    level_name,
                    level_id,
                    record,
                    isScore,
                    isMisc,
                    proof,
                    comment
                `)
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
                submission.record = submission.isScore ? parseInt(record) : Number.parseFloat(record).toFixed(2);
                delete submission.isScore;
            }

            // finally, once the data has been cleaned, update the submissions state
            setSubmissions(submissions => ({...submissions, [game.abb]: data}));

        } catch (error) {
            alert(error.message);
        }
    }

    // function that sets up queries for each game (to get recent submissions)
    const queryRecentSubmissions = async (games) => {
        for (const game of games) {
           querySubmissions(game);
        }
    }

    // function that is called if user is not a moderator. this page is only allowed for mods
    const navHome = () => {
        navigate("/");
    }

    // function that will update the currentGame based on the user's selection
    const changeGame = (game) => {
        setCurrentGame(game);
    }

    // function that is called when a moderator has reviewed a submission
    const removeSubmission = async (id) => {
        // create a copy of the list of submissions without the reviewed submission
        let submissionList = [];
        for (let submission of submissions[currentGame]) {
            if (submission.created_at !== id) {
                submissionList.push(submission);
            }
        }
        
        // now, update the submissions object
        setSubmissions(submissions => ({...submissions, [currentGame]: submissionList}));

        // finally, make a query to the recent submissions page to remove this submission
        try {
            const { error } = await supabase
                .from(`${currentGame}_recent_submissions`)
                .delete()
                .match({ created_at: id });

            if (error) {
                throw (error);
            }
        } catch (error) {
            alert(error.message);
        }
    }

    return { loading, gameList, submissions, currentGame, setLoading, checkForMod, changeGame, removeSubmission };
}

export default SubmissionInit;