import { useState } from "react";
import { useNavigate } from "react-router-dom";
import RecordsHelper from "../../helper/RecordsHelper";
import SubmissionRead from "../../database/read/SubmissionRead";

const RecordsInit = () => {
    /* ===== VARIABLES ===== */
    const path = window.location.pathname;
	const pathArr = path.split("/");
    const abb = pathArr[2];
    const category = pathArr[3];
    const type = pathArr[4];
    const isMisc = category === "misc" ? true : false;

    /* ===== STATES ===== */
    const [loading, setLoading] = useState(true);
    const [recordTable, setRecordTable] = useState({});
    const [game, setGame] = useState({ name: "", type: "", abb: "", other: "", isMisc: false });

    /* ===== FUNCTIONS ===== */

    // navigate used for redirecting
    const navigate = useNavigate();

    // helper functions
    const { validateRecordsPath, getRecordTable } = RecordsHelper();
    const { getSubmissions } = SubmissionRead();

    // function that verifies the path, and also computes the records for each stage
    const generateWorldRecords = async (games, allLevels, submissionReducer) => {
        // first, check the path
        const currentGame = games.find(game => game.abb === abb);
        const pathError = validateRecordsPath(currentGame);

        // if the game is not valid, let's navigate home and end the function
        if (pathError) {
            console.log(pathError);
            navigate("/");
            return;
        }

        // set game state hook, and filter levels list by game, misc and chart_type
        setGame({ ...currentGame, type: type, isMisc: isMisc, category: category, other: type === "score" ? "time" : "score" });
        const levels = allLevels.filter(row => row.game === abb && row.misc === isMisc && [`${ type }`, "both"].includes(row.chart_type));

        // get submissions, and filter based on the details.live field. order by level id in ascending order
        const allSubmissions = await getSubmissions(abb, category, type, submissionReducer);
        const submissions = allSubmissions.filter(row => row.details.live);
        submissions.sort((a, b) => a.level.id - b.level.id);

        // generate record table, and update react states
        const recordTable = getRecordTable(levels, submissions, type);
        setRecordTable(recordTable);
        setLoading(false);
        console.log(recordTable);
    };

    return { 
        loading,
        game,
        recordTable, 
        setLoading,
        generateWorldRecords
    };
};

export default RecordsInit;