/* ===== IMPORTS ===== */
import { ToastContext } from "../../utils/Contexts";
import { useContext, useState } from "react";
import SubmissionRead from "../../database/read/SubmissionRead";
import PageControls from "../PageControls/PageControls.js";

const RecentSubmissionsTable = () => {
    /* ===== VARIABLES ===== */
    const defaultSubmissions = { data: undefined, total: 0 };

    /* ===== STATES ===== */
    const [submissions, setSubmissions] = useState(defaultSubmissions);

    /* ===== CONTEXTS ===== */

    // add message function from toast context
    const { addMessage } = useContext(ToastContext);

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
        // first, reset the submissions state to default value before we query the db, and calculate start and end values
        setSubmissions(defaultSubmissions);
        const { start, end } = getStartAndEnd(numRows, pageNumber);

        // next, attempt to query the database for recent submissions
        try {
            const { submissions, count } = await queryRecentSubmissions(start, end, searchParams);
            setSubmissions({ data: submissions, total: count });
        } catch (error) {
            addMessage("Recent submissions data failing to load.", "error", 7000);
        }
    };

    return { submissions, fetchRecentSubmissions };
};

/* ===== EXPORTS ===== */
export default RecentSubmissionsTable;