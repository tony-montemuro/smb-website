/* ===== IMPORTS ===== */
import { useState } from "react";
import SubmissionRead from "../../database/read/SubmissionRead";
import PageControls from "../PageControls/PageControls.js";

const RecentSubmissionsTable = () => {
    /* ===== STATES ===== */
    const [submissions, setSubmissions] = useState({ data: [], total: 0 });

    /* ===== FUNCTIONS ===== */

    // database functions
    const { queryRecentSubmissions } = SubmissionRead();

    // helper functions
    const { getStartAndEnd } = PageControls();

    // FUNCTION 1: fetchRecentSubmissions - given a number of submissions and some search parameters, fetch submissions + total and update 
    // submissions state
    // PRECONDITIONS (2 parameters):
    // 1.) numSubmissions: an integer specifying the number of submissions that the table should render
    // 2.) searchParams: a URLSearchParams objects containing the set of filters
    // 3.) pageNumber: the page number the user is currently on
    // POSTCONDITIONS (1 possible outcome):
    // the array of submissions, as well as the total count, are returned, and the `submissions` states is updated by calling `setSubmissions`
    const fetchRecentSubmissions = async (numRows, searchParams, pageNumber) => {
        // first, compute the range of submissions to grab based on the parameters
        const { start, end } = getStartAndEnd(numRows, pageNumber);

        // using this, we can query recent submissions, & update the submissions state
        const { submissions, count } = await queryRecentSubmissions(start, end, searchParams);
        setSubmissions({ data: submissions, total: count });
    };

    return { submissions, fetchRecentSubmissions };
};

/* ===== EXPORTS ===== */
export default RecentSubmissionsTable;