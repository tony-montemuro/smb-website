/* ===== IMPORTS ===== */
import { useState } from "react";
import SubmissionRead from "../../database/read/SubmissionRead";

const RecentSubmissionsTable = () => {
    /* ===== STATES ===== */
    const [submissions, setSubmissions] = useState([]);
    const [total, setTotal] = useState(0);

    /* ===== FUNCTIONS ===== */

    // database functions
    const { queryRecentSubmissions } = SubmissionRead();

    // FUNCTION 1: fetchRecentSubmissions - given a number of rows and some search parameters, fetch submissions + total and update both states
    // PRECONDITIONS (2 parameters):
    // 1.) numRows: an integer specifying the number of rows that the table should render
    // 2.) searchParams: a URLSearchParams objects containing the set of filters
    // POSTCONDITIONS (1 possible outcome):
    // the array of submissions, as well as the total count, are returned, and the `submissions` and `total` states are both updated by calling
    // their respective setter functions (`setSubmissions` & `setTotal`)
    const fetchRecentSubmissions = async (numRows, searchParams) => {
        const { submissions, count } = await queryRecentSubmissions(numRows, searchParams);
        setSubmissions(submissions);
        setTotal(count);
    };

    return { submissions, total, fetchRecentSubmissions };
};

/* ===== EXPORTS ===== */
export default RecentSubmissionsTable;