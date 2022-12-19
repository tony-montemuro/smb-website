import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../components/SupabaseClient/SupabaseClient";
import MedalsHelper from "../../helper/MedalsHelper";

const MedalsInit = () => {
    // states
    const [game, setGame] = useState({ name: "", abb: "" });
    const [validGame, setValidGame] = useState(null);
    const [loading, setLoading] = useState(true);
    const [scoreLoading, setScoreLoading] = useState(true);
    const [timeLoading, setTimeLoading] = useState(true);
    const [isMisc, setIsMisc] = useState(false);
    const [scoreMedals, setScoreMedals] = useState([]);
    const [timeMedals, setTimeMedals] = useState([]);

    // path variables
    const path = window.location.pathname;
    const abb = path.split("/")[2];
    const category = path.split("/")[3];

    // helper functions
    const { createUserMap, createMedalTable, addPositionToMedals } = MedalsHelper();

    // navigate used for redirecting
    const navigate = useNavigate();

    // in the event that the submission is empty, this query will be run to verify that the game
    // definied by abb is a valid game. if it is, it will just return an object with a single property:
    // the name of the game. otherwise, it will return an error object
    const checkGame = async () => { 
        try {
            let { data: game, status, error } = await supabase
                .from("game")
                .select("abb, name")
                .eq("abb", abb)
                .single();

        // error handling
        if (error || status === 406) {
            throw error;
        }
        if (category !== "main" && category !== "misc") {
            const error = { code: 1, message: "Error: invalid category." }
            throw error;
        }

        // if there are no errors, update react hooks
        setValidGame(true);
        setGame(game);
        setIsMisc(category === "misc" ? true : false);

        } catch(error) {
            // if there is an error, navigate back to the home screen
            if (error.code === 'PGRST116') {
                console.log("Error: Invalid game.");
            } else {
                console.log(error.message);
            }
            navigate("/");
        }
    };

    // function that will query the submissions page and generate a medal table leaderboard
    const medalTableQuery = async(type) => {
        try {
            // initialize variables
            const misc = category === "misc" ? true : false;

            // query all submissions for abb that are also live in the {type} submission table
            let { data: submissions, status, error } = await supabase
                .from(`${type}_submission`)
                .select(`
                    profiles:user_id ( id, username, country, avatar_url ),
                    level (id, misc, chart_type, mode (game (name))),
                    ${type},
                    live
                `)
                .eq("game_id", abb)
                .eq("live", true)
                .order(`${type}`, { ascending: false });

            // error handling
            if (error && status !== 406) {
                throw error;
            }

            // let's filter the list based on the status of the category
            submissions = submissions.filter(obj => obj.level.misc === misc);
            
            // if the submission query comes back empty, there are either no {type} submissions to this game.
            // or no submissions to the game at all. we can just end the function prematurely, then.
            if (submissions.length === 0) {
                type === "score" ? setScoreLoading(false) : setTimeLoading(false);
                return;
            }

            //next, generate medal table with positions
            const userMap = createUserMap(submissions);
            const medalTable = createMedalTable(userMap, submissions, type);
            addPositionToMedals(medalTable);

            // finally, update react states
            setIsMisc(misc);
            type === "score" ? setScoreMedals(medalTable) : setTimeMedals(medalTable);
            type === "score" ? setScoreLoading(false) : setTimeLoading(false);
            
            console.log(medalTable);
            console.log(submissions);

        } catch(error) {
            if (error.code === 1) {
                console.log(error.message);
            } else {
                console.log(error);
            }
            navigate("/");
        }
    };

    return { 
        game,
        validGame,
        loading,
        scoreLoading,
        timeLoading,
        isMisc, 
        scoreMedals,
        timeMedals,
        setLoading,
        checkGame,
        medalTableQuery 
    };
};

export default MedalsInit;