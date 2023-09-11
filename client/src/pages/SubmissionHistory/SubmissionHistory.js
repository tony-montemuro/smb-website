/* ===== IMPORTS ===== */
import { MessageContext } from "../../utils/Contexts";
import { useContext, useState } from "react";
import { useLocation } from "react-router-dom";
import SubmissionRead from "../../database/read/SubmissionRead";

const SubmissionHistory = () => {
    /* ===== VARIABLES ===== */
    const location = useLocation();
	const path = location.pathname.split("/");
	const abb = path[2];
	const category = path[3];
	const type = path[4];
	const levelName = path[5];
    const profileId = parseInt(path[6]);

    /* ===== CONTEXTS ===== */

    // add message function from message context
    const { addMessage } = useContext(MessageContext);

    /* ===== STATES ===== */
    const [submissions, setSubmissions] = useState(undefined);

    /* ===== FUNCTIONS ===== */

    // database functions
    const { getChartSubmissionsByProfile } = SubmissionRead();

    // FUNCTION 1: fetchSubmissions - given information from the path, get the list of submissions from the database
    // PRECONDITIONS: NONE
    // POSTCONDITIONS (1 possible outcome):
    // we query a highly filtered list of submissions according to the url path, and update the submissions state by calling the 
    // setSubmissions() function
    const fetchSubmissions = async () => {
        try {
            // attempt to grab the submissions, and update submission state by calling `setSubmissions()`
            const submissions = await getChartSubmissionsByProfile(abb, category, levelName, type, profileId)
            setSubmissions(submissions);

        } catch (error) {
            // if submissions fail to load, render an error message
            addMessage("Failed to fetch submission data. If refreshing the page does not work, the database may be experiencing some issues.", "error")
        }
    };

    return { 
        submissions,
        fetchSubmissions
    };
};

/* ===== EXPORTS ===== */
export default SubmissionHistory;