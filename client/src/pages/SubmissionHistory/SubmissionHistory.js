/* ===== IMPORTS ===== */
import { useContext, useState } from "react";
import { UserContext } from "../../utils/Contexts";
import AllSubmissionRead from "../../database/read/AllSubmissionRead";

const SubmissionHistory = () => {
    /* ===== CONTEXTS ===== */

    // user state from user context
    const { user } = useContext(UserContext);

    /* ===== STATES ===== */
    const [submissions, setSubmissions] = useState(undefined);
    const [profile, setProfile] = useState(undefined);

    /* ===== FUNCTIONS ===== */

    // database functions
    const { queryFilteredSubmissions } = AllSubmissionRead();

    // FUNCTION 1: getSubmissions - given the abb, levelName, userId, and type from path, get the list of submissions from the database
    // PRECONDITIONS (4 parameters):
    // 1.) abb: a string value, representing a game's abb value. this is used to uniquely identify it.
    // 2.) levelName: a string value, representing the name of a level.
    // 3.) profileId: an integer value, representing a user's profile id. this is used to uniquely identify a profile.
    // 4.) type: a string value, either "score" or "time"
    // POSTCONDITIONS (1 possible outcome):
    // given our parameters, we get a filtered list of submissions from the database, and update the submissions state by calling the
    // setSubmissions() function
    const getSubmissions = async (abb, levelName, profileId, type) => {
        const isScore = type === "score";
        const submissions = await queryFilteredSubmissions(abb, levelName, profileId, isScore);
        setSubmissions(submissions);
    };

    // FUNCTION 2: cantModify - function that returns false if a submission is modifyable, true otherwise
    // PRECONDITIONS (1 parameter):
    // 1.) submission - a submission object
    // POSTCONDITIONS (2 possible outcome):
    // if a submission is a "current" AND is approved OR has a "relevant" report submission, this function returns true (CANNOT update)
    // otherwise, false is returned
    const cantModify = submission => {
        const current = submission.submission ? submission.submission[0] : undefined;
        return current && (current.approved || (current.report[0] && (current.report[0].profile_id === user.profile.id || current.report[0].creator_id === user.profile.id)));
    };

    // FUNCTION 3: getUpdateReasoning - function that returns a string explaining why a submission cannot be updated
    // PRECONDITIONS (1 parameter):
    // 1.) submission - a submission object that is NOT able to be updated
    // POSTCONDITIONS (1 possible outcome):
    // depending on different factors of the submission, a reasoning is returned in the form of a string
    const getUpdateReasoning = submission => {
        const current = submission.submission[0];

        // CASE 1: Submission is approved
        if (current.approved) {
            return "This submission cannot be updated since it has been approved by a moderator.";
        }

        // CASE 2: Submission has been reported, and the submission belongs to the user
        if (current.report[0].profile_id === user.profile.id) {
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
        const current = submission.submission[0];

        // CASE 1: Submission is approved
        if (current.approved) {
            return "This submission cannot be deleted since it has been approved by a moderator.";
        }

        // CASE 2: Submission has been reported, and the submission belongs to the user
        if (current.report[0].profile_id === user.profile.id) {
            return "This submission cannot be deleted since you own it, and it has a report. Allow a different moderator to handle it.";
        }

        // CASE 3: Submission has been reported, and the report was put out by the curent user
        return "This submission cannot be deleted since it was reported by yourself. Allow a different moderator to handle it.";
    };

    return { 
        submissions,
        profile, 
        setProfile, 
        getSubmissions,
        cantModify,
        getDeleteReasoning,
        getUpdateReasoning
    };
};

/* ===== EXPORTS ===== */
export default SubmissionHistory;