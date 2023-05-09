/* ===== IMPORTS ===== */
import { useState } from "react";
import AllSubmissionRead from "../../database/read/AllSubmissionRead";

const Home = () => {
    /* ===== STATES ===== */
    const [submissions, setSubmissions] = useState(undefined);

    /* ===== FUNCTIONS ===== */

    // database functions
    const { queryRecentSubmissions } = AllSubmissionRead();

    // FUNCTION 1: getSubmissions - retrieve 5 most recent submissions from database, and update the submissions state
    // PRECONDITIONS (1 condition):
    // this function should be called when the Home component is first mounted
    // POSTCONDITIONS (1 possible outcome):
    // the most recent submissions are retrieved, and the submissions state is updated by calling setSubmissions() function
    const getSubmissions = async () => {
        const submissions = await queryRecentSubmissions();
        setSubmissions(submissions);
    };

    return { submissions, getSubmissions };
};

/* ===== EXPORTS ===== */
export default Home;