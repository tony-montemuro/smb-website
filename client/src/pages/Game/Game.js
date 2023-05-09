/* ===== IMPORTS ===== */
import { useState } from "react";
import AllSubmissionRead from "../../database/read/AllSubmissionRead";

const Game = () => {
    /* ===== STATES ===== */
    const [submissions, setSubmissions] = useState(undefined);

    /* ===== FUNCTIONS ===== */

    // database functions
    const { queryRecentSubmissions } = AllSubmissionRead();
    
    // FUNCTION 1: getSubmissions - given an abb, get the 5 most recent submissions for that game, and update the submission state
    // PRECONDITIONS (1 parameter):
    // 1.) abb: a string value, representing a game's abb value. this is used to uniquely identify it.
    // POSTCONDITIONS (1 possible outcome):
    // query the recent submissions, and update the submissions state by calling the setSubmissions() function
    const getSubmissions = async (abb) => {
        const submissions = await queryRecentSubmissions(abb);
        setSubmissions(submissions);
    };

    return { submissions, getSubmissions };
};

/* ===== EXPORTS ===== */
export default Game;