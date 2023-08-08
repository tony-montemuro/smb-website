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
    const [updateSubmission, setUpdateSubmission] = useState(undefined);
    const [deleteSubmission, setDeleteSubmission] = useState(undefined);
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
        console.log(submissions);
        setSubmissions(submissions);
    };

    // FUNCTION 2: cantUpdate - function that returns false if a submission is updatable, true otherwise
    // PRECONDITIONS (1 parameter):
    // 1.) submission - a submission object
    // POSTCONDITIONS (2 possible outcome):
    // if a submission is a "current" submission that's approved, this function returns true (CANNOT update)
    // otherwise, false is returned
    const cantUpdate = submission => {
        const current = submission.submission ? submission.submission[0] : undefined;
        return current && (current.approved);
    };

    // FUNCTION 3: cantDelete - function that returns false if a submission is deleteable, true otherwise
    // PRECONDITIONS (1 parameter):
    // 1.) submission - a submission object
    // POSTCONDITIONS (2 possible outcome):
    // if a submission is a "current" AND is approved OR has a "relevant" report submission, this function returns true (CANNOT update)
    // otherwise, false is returned
    const cantDelete = submission => {
        const current = submission.submission ? submission.submission[0] : undefined;
        return current && (current.approved || (current.report && (current.profile_id !== user.profile.id || current.creator_id !== user.profile.id)));
    };

    return { 
        submissions,
        updateSubmission, 
        deleteSubmission, 
        profile, 
        setUpdateSubmission,
        setDeleteSubmission, 
        setProfile, 
        getSubmissions,
        cantUpdate,
        cantDelete
    };
};

/* ===== EXPORTS ===== */
export default SubmissionHistory;