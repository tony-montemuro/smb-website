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
    const { validateMedalsPath, getUserMap, getMedalTable, insertPositionToMedals } = MedalsHelper();
    const { getSubmissions } = SubmissionRead();

    // navigate used for redirecting
    const navigate = useNavigate();

    // function that verifies the path, and generates the medal table from array of submissions
    const generateMedals = async(type, games, submissionReducer) => {
        // first, validate the path
        const currentGame = games.find(game => game.abb === abb);
        const pathError = validateMedalsPath(currentGame);

        // if the game is not valid, let's navigate home and end the function
        if (pathError) {
            console.log(pathError);
            navigate("/");
            return;
        }

        // update game state hook
        setGame({ ...currentGame, is_misc: isMisc });

        // get all submissions, filter based on the details.live field, and then sort by level id
        const allSubmissions = await getSubmissions(abb, category, type, submissionReducer);
        const submissions = allSubmissions.filter(row => row.details.live);
        submissions.sort((a, b) => b.level.id > a.level.id ? -1 : 1);
        
        // if the filtered object is empty, there are either no { type } submissions to this { abb } in the same { category }.
        // or no submissions to the game at all. we can just end the function prematurely, then.
        if (submissions.length === 0) {
            dispatchMedals({ type: type, data: [] });
            return;
        }

        // generate medal table with positions
        const userMap = getUserMap(submissions);
        const medalTable = getMedalTable(userMap, submissions);
        insertPositionToMedals(medalTable);

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