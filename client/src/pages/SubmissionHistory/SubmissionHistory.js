/* ===== IMPORTS ===== */
import { MessageContext } from "../../utils/Contexts";
import { useContext, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import RPCRead from "../../database/read/RPCRead";
import SubmissionRead from "../../database/read/SubmissionRead";

const SubmissionHistory = () => {
    /* ===== VARIABLES ===== */
    const navigate = useNavigate();
    const location = useLocation();
	const path = location.pathname.split("/");
	const abb = path[2];
	const category = path[3];
	const type = path[4];
	const levelName = path[5];
    const profileId = parseInt(path[6]);
    const submissionsInit = { normal: undefined, tas: undefined };

    /* ===== CONTEXTS ===== */

    // add message function from message context
    const { addMessage } = useContext(MessageContext);

    /* ===== STATES ===== */
    const [submissions, setSubmissions] = useState(submissionsInit);
    const [runType, setRunType] = useState(undefined);

    /* ===== FUNCTIONS ===== */

    // database functions
    const { getChartSubmissionsByProfile } = SubmissionRead();
    const { getProfile } = RPCRead();

    // FUNCTION 1: fetchProfile - code that is executed when the SubmissionHistory component mounts, to validate the URL path
    // PRECONDITIONS (1 parameter):
    // 1.) profileId: an integer corresponding to the primary key of a profile in the database
    // POSTCONDITIONS (2 possible outcomes):
    // if the query is successful, a profile object is simply returned
    // if the query is unsuccessful, this function will render an error message to the screen, and return an undefined object,
    // leaving the `SubmissionHistory` page stuck loading
    const fetchProfile = async profileId => {
        try {
            const profile = await getProfile(profileId);
            return profile;
        } catch (error) {
            addMessage("There was an issue fetching this users data.", "error");
            return undefined;
        };
    };

    // FUNCTION 2: fetchSubmissions - given information from the path, get the list of submissions from the database
    // PRECONDITIONS: NONE
    // POSTCONDITIONS (1 possible outcome):
    // we query a highly filtered list of submissions according to the url path, and update the submissions state by calling the 
    // setSubmissions() function
    const fetchSubmissions = async () => {
        try {
            // attempt to grab the submissions
            const submissions = await getChartSubmissionsByProfile(abb, category, levelName, type, profileId);

            // if query is successful, next split submissions into two arrays: normal, and tas
            const normal = submissions.filter(submission => !submission.tas);
            const tas = submissions.filter(submission => submission.tas);

            // update submission state hook by calling the setSubmissions() function
            setSubmissions({ normal, tas });

        } catch (error) {
            // if submissions fail to load, render an error message
            addMessage("Failed to fetch submission data. If refreshing the page does not work, the database may be experiencing some issues.", "error")
        }
    };

    // FUNCTION 3: handleTabClick - code that is executed when the user selects a tab
    // PRECONDITIONS (1 parameter):
    // 1.) otherRunType - a string, either "normal" or "TAS"
    // POSTCONDITIONS (2 possible outcomes):
    // if otherRunType and runType are the same, this function does nothing
    // otherwise, the user will be navigated to the "other" submission history page for the other run type
    const handleTabClick = otherRunType => {
        if (runType !== otherRunType) {
            navigate(`/games/${ abb }/${ category }/${ type }/${ levelName }/${ profileId }/${ otherRunType }`);
        }
    };

    return {
        submissions,
        runType,
        setRunType,
        fetchProfile,
        fetchSubmissions,
        handleTabClick
    };
};

/* ===== EXPORTS ===== */
export default SubmissionHistory;