/* ===== IMPORTS ===== */
import { useLocation } from "react-router-dom";
import { useState } from "react"; 
import AllSubmissionRead from "../../database/read/AllSubmissionRead";

const SubmissionHistory = () => {
    /* ===== VARIABLES ===== */
    const location = useLocation();
    const path = location.pathname.split("/");
    const abb = path[2];
    const type = path[4];
    const levelName = path[5];
    const profileId = path[6];

    /* ===== STATES ===== */
    const [submissions, setSubmissions] = useState(undefined);
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
        const isScore = type === "score" ? true : false;
        const submissions = await queryFilteredSubmissions(abb, levelName, profileId, isScore);
        setSubmissions(submissions);
    };

    // FUNCTION 2: setDelete - given a submission object, update the delete submission state (which will pull up the delete popup)
    // PRECONDITIONS (1 parameter):
    // 1.) submission: a submission object, corresponding to one of the submissions rendered on-screen
    // POSTCONDITIONS (1 possible outcome):
    // combining data from the submission object, as well as path information, set the delete submission by calling the
    // setDeleteSubmission() function
    const setDelete = (submission) => {
        setDeleteSubmission({
            id: submission.id,
			profile_id: profileId,
			game_id: abb,
			level_id: levelName,
			type: type,
			username: profile.username,
			record: submission.record
        });
    };

    return { submissions, deleteSubmission, profile, setDeleteSubmission, setProfile, getSubmissions, setDelete };
};

/* ===== EXPORTS ===== */
export default SubmissionHistory;