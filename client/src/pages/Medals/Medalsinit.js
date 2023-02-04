import { useState, useReducer } from "react";
import { useNavigate } from "react-router-dom";
import MedalsHelper from "../../helper/MedalsHelper";
import SubmissionRead from "../../database/read/SubmissionRead";

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
    const { createUserMap, getUserMap, createMedalTable, getMedalTable, addPositionToMedals, inserPositionToMedals } = MedalsHelper();
    const { retrieveSubmissions, newQuery } = SubmissionRead();

    // navigate used for redirecting
    const navigate = useNavigate();

    // function that verifies the path, and generates the medal table from array of submissions
    const generateMedals = async(type, games, submissionState) => {
        // first, check the path
        const currentGame = games.find(game => game.abb === abb);

        // if the game is not valid, let's navigate home and end the function
        if (!currentGame) {
            console.log("Error: Invalid game.");
            navigate("/");
            return;
        }

        // update game state hook
        setGame({ ...currentGame, isMisc: isMisc });

        // get submissions, and filter based on the live field and the level.misc field
        const submissions = await retrieveSubmissions(abb, type, submissionState);
        const filtered = submissions.filter(row => row.live === true && row.level.misc === isMisc);

        // NEW - get submissions, and filter based on the live field and the level.misc field, then sort by level id
        const list = await newQuery(abb, type);
        const newFiltered = list.filter(row => row.details.live && row.level.misc === isMisc);
        newFiltered.sort((a, b) => b.level.id > a.level.id ? -1 : 1);
        
        // if the filtered object is empty, there are either no {type} submissions to this game.
        // or no submissions to the game at all. we can just end the function prematurely, then.
        if (filtered.length === 0) {
            dispatchMedals({ type: type, data: [] });
            return;
        }

        // NEW - if the filtered object is empty, there are either no {type} submissions to this game.
        // or no submissions to the game at all. we can just end the function prematurely, then.
        if (newFiltered.length === 0) {
            // dispatchMedals({ type: type, data: [] });
            // return;
        }

        //next, generate medal table with positions
        const userMap = createUserMap(filtered);
        const medalTable = createMedalTable(userMap, filtered, type);
        addPositionToMedals(medalTable);

        // NEW - generate medal table with positions
        const newUserMap = getUserMap(newFiltered);
        const newMedalTable = getMedalTable(newUserMap, newFiltered);
        inserPositionToMedals(newMedalTable);
        console.log("MEDAL TABLE GENERATED FROM NEW BACK-END:");
        console.log(newMedalTable);

        // finally, update react medals reducer hook
        dispatchMedals({ type: type, data: medalTable });
    };

    return { 
        game,
        loading,
        medals,
        setLoading,
        generateMedals
    };
};

export default MedalsInit;