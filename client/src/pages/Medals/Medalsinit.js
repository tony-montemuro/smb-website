import { useState, useReducer } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../components/SupabaseClient/SupabaseClient";
import MedalsHelper from "../../helper/MedalsHelper";

const MedalsInit = () => {
    /* ===== VARIABLES ===== */
    const path = window.location.pathname;
    const abb = path.split("/")[2];
    const category = path.split("/")[3];
    const isMisc = category === "misc" ? true : false;
    
    /* ===== STATES & REDUCERS ===== */
    const [game, setGame] = useState({ name: null, abb: null, isMisc: isMisc });
    const [loading, setLoading] = useState(true);
    const [medals, dispatchMedals] = useReducer((state, action) => {
        return { ...state, [action.type]: action.data };
    }, { score: null, time: null });

    /* ===== FUNCTIONS ===== */

    // helper functions
    const { createUserMap, createMedalTable, addPositionToMedals } = MedalsHelper();

    // navigate used for redirecting
    const navigate = useNavigate();

    // in the event that the submission is empty, this query will be run to verify that the game
    // definied by abb is a valid game. if it is, it will just return an object with two properties:
    // the name of the game, and the game's abbreviation. otherwise, it will return an error object.
    const checkGame = async () => { 
        try {
            let { data: gameData, status, error } = await supabase
                .from("game")
                .select("abb, name")
                .eq("abb", abb)
                .single();

        // error handling
        if (error || status === 406) {
            throw error;
        }

        // if there are no errors, update game hook
        setGame({ ...game, name: gameData.name, abb: gameData.abb });

        } catch(error) {
            // if there is an error, navigate back to the home screen
            if (error.code === 'PGRST116') {
                console.log("Error: Invalid game.");
            } else {
                console.log(error);
                alert(error.message);
            }
            navigate("/");
        }
    };

    // function that will query the submissions page and generate a medal table leaderboard
    const medalTableQuery = async(type) => {
        try {
            // query all submissions for abb that are also live in the {type} submission table,
            // and are also from levels of type {isMisc}
            let { data: submissions, status, error } = await supabase
                .from(`${type}_submission`)
                .select(`
                    profiles:user_id ( id, username, country, avatar_url ),
                    level!inner (id, misc, chart_type, mode (game (name))),
                    ${type},
                    live
                `)
                .eq("game_id", abb)
                .eq("live", true)
                .eq("level.misc", isMisc)
                .order(`${type}`, { ascending: false });

            // error handling
            if (error && status !== 406) {
                throw error;
            }
            
            // if the submission query comes back empty, there are either no {type} submissions to this game.
            // or no submissions to the game at all. we can just end the function prematurely, then.
            if (submissions.length === 0) {
                dispatchMedals({ type: type, data: [] });
                return;
            }

            //next, generate medal table with positions
            const userMap = createUserMap(submissions);
            const medalTable = createMedalTable(userMap, submissions, type);
            addPositionToMedals(medalTable);

            // finally, update react medals reducer hook
            dispatchMedals({ type: type, data: medalTable });
            
            console.log(medalTable);
            console.log(submissions);

        } catch(error) {
            // if there is an error, navigate back to home page
            if (error.code === 1) {
                console.log(error.message);
            } else {
                console.log(error);
                alert(error.message);
            }
            navigate("/");
        }
    };

    return { 
        game,
        loading,
        medals,
        setLoading,
        checkGame,
        medalTableQuery
    };
};

export default MedalsInit;