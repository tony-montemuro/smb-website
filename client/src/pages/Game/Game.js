/* ===== IMPORTS ===== */
import { useState } from "react";
import GameRead from "../../database/read/GameRead";

const Game = () => {
    /* ===== STATES ===== */
    const [submissions, setSubmissions] = useState(undefined);

    /* ===== FUNCTIONS ===== */

    // database functions
    const { queryRecentGameSubmissions } = GameRead();
    
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