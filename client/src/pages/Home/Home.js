/* ===== IMPORTS ===== */
import { useState } from "react";
import HomeRead from "../../database/read/HomeRead";

const Home = () => {
    /* ===== STATES ===== */
    const [submissions, setSubmissions] = useState(undefined);

    /* ===== FUNCTIONS ===== */

    // database functions
    const { queryRecentSubmissions } = HomeRead();

    // FUNCTION 1: getSubmissions
    const getSubmissions = async () => {
        const submissions = await queryRecentSubmissions();
        setSubmissions(submissions);
        console.log(submissions);
    };

    return { submissions, getSubmissions };
};

/* ===== EXPORTS ===== */
export default Home;