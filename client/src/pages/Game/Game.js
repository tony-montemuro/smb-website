/* ===== IMPORTS ===== */
import { useState } from "react";
import AllSubmissionRead from "../../database/read/AllSubmissionRead";

const Game = () => {
    /* ===== STATES ===== */
    const [submissions, setSubmissions] = useState(undefined);

    /* ===== FUNCTIONS ===== */

    // database functions
    const { queryRecentGameSubmissions } = AllSubmissionRead();
    
    // FUNCTION 1: getSubmissions
    const getSubmissions = async (abb) => {
        const submissions = await queryRecentGameSubmissions(abb);
        setSubmissions(submissions);
        console.log(submissions);
    };

    return { submissions, getSubmissions };
};

/* ===== EXPORTS ===== */
export default Game;