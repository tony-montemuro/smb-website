/* ===== IMPORTS ===== */
import { MessageContext } from "../../utils/Contexts";
import { useContext, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import GameHelper from "../../helper/GameHelper";
import GameRead from "../../database/read/GameRead";
import RPCRead from "../../database/read/RPCRead";

const ModeratorLayout = () => {
    /* ===== VARIABLES ===== */
    const pageType = useLocation().pathname.split("/")[2];
    const navigate = useNavigate();

    /* ===== STATES ===== */
    const [submissions, setSubmissions] = useState(undefined);
    const [games, setGames] = useState(undefined);

    /* ===== CONTEXTS ===== */

    // addMessage function from message context
    const { addMessage } = useContext(MessageContext);

    /* ===== FUNCTIONS ===== */

    // database functions
    const { getUnapproved } = RPCRead();
    const { queryGamesInfo } = GameRead();

    // helper functions
    const { cleanGameObject } = GameHelper();

    // FUNCTION 1: partitionByType - function that takes the list of all submissions, and returns two separate lists, filtered
    // by whether or not the submission has a report
    // PRECONDITIONS (1 parameter):
    // 1.) allSubmissions: an array of all unapproved submission objects
    // POSTCONDITIONS (2 returns, 1 possible outcome):
    // the array is filtered into two arrays, both of which are returned:
    // 1.) recent: the subset of submissions where there is no report
    // 2.) reported: the subset of submissions who have a report unrelated to the current moderator
    const partitionByType = allSubmissions => {
        // define two separate arrays: one for new submissions, and one for reported ones
        const recentSubmissions = [], reportedSubmissions = [];

        // fill the two arrays
        allSubmissions.forEach(submission => submission.report ? reportedSubmissions.push(submission) : recentSubmissions.push(submission));

        return { recentSubmissions, reportedSubmissions };
    };

    // FUNCTION 2: getSortedSubmissions - a function that returns a sorted copy of array of submissions based on the type of submission
    // PRECONDITIONS (2 parameters):
    // 1.) submissions: an array of submission objects
    // 2.) isNew: a boolean variable which controls the sort style
    // POSTCONDITIONS (2 possible outcomes):
    // in both cases, the same array is returned, but sorted according to the `isNew` parameter
    // if `isNew` it's set to true, we treat the array as "recent submissions", and sort them based on the
    // id field.
    // otherwise, we treat the array as "reported submissions", and sort them based on the report.report_date field
    const getSortedSubmissions = (submissions, isNew) => {
        return submissions.sort((a, b) => {
            return isNew ? a.id.localeCompare(b.id) : a.report.report_date.localeCompare(b.report.report_date);
        });
    };

    // FUNCTION 3: getCategorizedObject - a function that takes an array of submissions, and returns an object that categorizes
    // each submission by game
    // PRECONDITIONS (1 parameter):
    // 1.) submissions: an array of submission objects
    // 2.) games: an array of simple game objects
    // POSTCONDITIONS (1 possible outcome):
    // using the games array from the static cache context, we generate an object that has fields for each game. each field 
    // corresponds to an array of submissions
    const getCategorizedObject = (submissions, games) => {
        // define our categorized object
        const categorized = {};

        // define the fields for each game
        games.forEach(game => {
            categorized[game.abb] = [];
        });

        // finally, fill our array with each submission object from the `submissions` parameter
        submissions.forEach(submission => {
            categorized[submission.level.mode.game.abb].push(submission);
        });

        return categorized;
    };

    // FUNCTION 4: updateLayout - code that is executed when the ModeratorLayout component mounts, to fetch game & submission data
    // PRECONDITIONS: NONE
    // POSTCONDITIONS (2 possible outcomes):
    // if the query successfully returns both arrays of data, filter allSubmissions into two distinct arrays: recent and reports
    // recent submissions are simply ones that were recently submitted but not yet approved
    // report submissions are ones that have been reported
    // once the filtering is complete, we can update both the `games` and `submissions` states by calling their respective setter functions 
    // if the query is a failure, render an error message to the user, and set both fields in the return array equal to undefined
    const updateLayout = async () => {
        try {
            // first, let's just fetch the games and allSubmissions data
            const [games, allSubmissions] = await Promise.all([queryGamesInfo(), getUnapproved()]);

            // next, for each game, clean the object
            for (let game of games) {
                cleanGameObject(game);
            }

            // partition all submissions into two arrays
            const { recentSubmissions, reportedSubmissions } = partitionByType(allSubmissions);

            // sort both arrays. the recent submissions are ordered by id in descending order, while the reported
            // submissions are sorted by report_date in descending order
            const sortedRecentSubmissions = getSortedSubmissions(recentSubmissions, true);
            const sortedReportedSubmissions = getSortedSubmissions(reportedSubmissions, false);

            // generate an object that categorize each submissions by game
            const recent = getCategorizedObject(sortedRecentSubmissions, games);
            const reported = getCategorizedObject(sortedReportedSubmissions, games);

            // finally, let's update `games` & `submissions` state hooks
            setGames(games);
            setSubmissions({ recent, reported });

        } catch (error) {
            addMessage("Moderator layout data failed to load / update. Refresh the page and try again.", "error");
            return { games: undefined, submissions: undefined };
        }
    };

    // FUNCTION 5: handleTabClick - code that is executed when a moderator layout tab is selected
    // PRECONDITIONS (1 parameter):
	// 1.) otherPageType: a string, either "approvals", "reports", "post", or undefined
	// POSTCONDITIONS (2 possible outcome):
	// if otherPageType and pageType are the same, this function does nothing
	// otherwise, the user is navigated to the other page
	const handleTabClick = otherPageType => {
		if (otherPageType !== pageType) {
			otherPageType ? navigate(`/moderator/${ otherPageType }`) : navigate("/moderator");
		}
	};

    // FUNCTION 6: getNumberOfSubmissions - function that returns the number of submissions in a submissions object
    // PRECONDITIONS (1 parameter):
    // 1.) submissions: an object which contains all the submissions categorized by game, or null
    // POSTCONDITIONS (2 possible outcomes):
    // if submissions is null, this function will simply return 0
    // otherwise, each submission is tallied up, and the total number is returned
    const getNumberOfSubmissions = submissions => {
        // if submissions is null, just return 0
        if (!submissions) {
            return 0;
        }

        // otherwise, count up all the submissions into a counter, and return that value
        let counter = 0;
        Object.keys(submissions).forEach(game => {
            counter += submissions[game].length; 
        });
        
        return counter;
    };

    return { games, submissions, updateLayout, handleTabClick, getNumberOfSubmissions };
};

/* ===== EXPORTS ===== */
export default ModeratorLayout;