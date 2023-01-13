import { useState, useReducer } from "react";
import { useNavigate } from "react-router-dom";
import MedalsHelper from "../../helper/MedalsHelper";
import SubmissionQuery from "../../helper/SubmissionQuery";

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
    const { query } = SubmissionQuery();

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
        setGame(currentGame);

        // from here, we have two cases. if user is accessing already cached submissions, we can fetch
        // this information from submissionState. Otherwise, we need to query, and set the submission state
        let submissions = {};
        if (submissionState.state && abb in submissionState.state) {
            submissions = submissionState.state[abb];
        } else {
            submissions = await query(abb, type);
            submissionState.setState({ ...submissionState.state, [abb]: submissions });
        }

        // filter the submission object based on the live field and the level.misc field
        const filtered = submissions.filter(row => row.live === true && row.level.misc === isMisc);
        
        // if the filtered object is empty, there are either no {type} submissions to this game.
        // or no submissions to the game at all. we can just end the function prematurely, then.
        if (filtered.length === 0) {
            dispatchMedals({ type: type, data: [] });
            return;
        }

        //next, generate medal table with positions
        const userMap = createUserMap(filtered);
        const medalTable = createMedalTable(userMap, filtered, type);
        addPositionToMedals(medalTable);

        // finally, update react medals reducer hook
        dispatchMedals({ type: type, data: medalTable });
        
        console.log(medalTable);
        console.log(submissions);
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