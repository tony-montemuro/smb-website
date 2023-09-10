/* ===== IMPORTS ===== */
import { MessageContext, UserContext } from "../../utils/Contexts";
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

    // user state from user context
    const { user } = useContext(UserContext);

    // add message function from message context
    const { addMessage } = useContext(MessageContext);

    /* ===== STATES ===== */
    const [submissions, setSubmissions] = useState(undefined);
    const [profile, setProfile] = useState(undefined);

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

    // FUNCTION 2: cantModify - function that returns false if a submission is modifyable, true otherwise
    // PRECONDITIONS (1 parameter):
    // 1.) submission - a submission object
    // POSTCONDITIONS (2 possible outcome):
    // if a submission is approved OR has a "relevant" report submission, this function returns true (CANNOT update)
    // otherwise, false is returned
    const cantModify = submission => {
        return submission.approve || (submission.report && (submission.profile.id === user.profile.id || submission.report.creator_id === user.profile.id));
    };

    // FUNCTION 3: getUpdateReasoning - function that returns a string explaining why a submission cannot be updated
    // PRECONDITIONS (1 parameter):
    // 1.) submission - a submission object that is NOT able to be updated
    // POSTCONDITIONS (1 possible outcome):
    // depending on different factors of the submission, a reasoning is returned in the form of a string
    const getUpdateReasoning = submission => {
        // CASE 1: Submission is approved
        if (submission.approve) {
            return "This submission cannot be updated since it has been approved by a moderator.";
        }

        // CASE 2: Submission has been reported, and the submission belongs to the user
        if (submission.profile.id === user.profile.id) {
            return "This submission cannot be updated since you own it, and it has a report. Allow a different moderator to handle it.";
        }

        // CASE 3: Submission has been reported, and the report was put out by the curent user
        return "This submission cannot be updated since it was reported by yourself. Allow a different moderator to handle it.";
    };

    // FUNCTION 4: getDeleteReasoning - function that returns a string explaining why a submission cannot be deleted
    // PRECONDITIONS (1 parameter):
    // 1.) submission - a submission object that is NOT able to be deleted
    // POSTCONDITIONS (1 possible outcome):
    // depending on different factors of the submission, a reasoning is returned in the form of a string
    const getDeleteReasoning = submission => {
        // CASE 1: Submission is approved
        if (submission.approve) {
            return "This submission cannot be deleted since it has been approved by a moderator.";
        }

        // CASE 2: Submission has been reported, and the submission belongs to the user
        if (submission.profile.id === user.profile.id) {
            return "This submission cannot be deleted since you own it, and it has a report. Allow a different moderator to handle it.";
        }

        // CASE 3: Submission has been reported, and the report was put out by the curent user
        return "This submission cannot be deleted since it was reported by yourself. Allow a different moderator to handle it.";
    };

    return { 
        submissions,
        profile, 
        setProfile, 
        fetchSubmissions,
        cantModify,
        getDeleteReasoning,
        getUpdateReasoning
    };
};

/* ===== EXPORTS ===== */
export default SubmissionHistory;