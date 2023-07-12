/* ===== IMPORTS ===== */
import { useContext, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { GameContext, MessageContext, UserContext } from "../../utils/Contexts";
import SubmissionRead from "../../database/read/SubmissionRead";

const Levelboard = () => {
	/* ===== CONTEXTS ===== */

	// game state from game context
	const { game } = useContext(GameContext);

	// add message function from message context
	const { addMessage } = useContext(MessageContext);

	// user state from user context
	const { user } = useContext(UserContext);

	/* ===== VARIABLES ===== */
	const location = useLocation();
	const path = location.pathname.split("/");
	const abb = path[2];
	const category = path[3];
	const type = path[4];
	const levelName = path[5];
	const boardInit = { records: null, report: null };
	const navigate = useNavigate();

	/* ===== STATES ===== */
	const [board, setBoard] = useState(boardInit);
	const [userSubmission, setUserSubmission] = useState(undefined);

	/* ===== FUNCTIONS ===== */
	
	// database functions
	const { getSubmissions } = SubmissionRead();

	// FUNCTION 1: getPrevAndNext - get the previous and next level names
    // PRECONDTIONS (2 parameters):
    // 1.) category: the current category, either "main" or "misc", also defined in the path
    // 2.) levelName: a string corresponding to the name of a level, also defined in the path
    // POSTCONDITIONS (1 possible outcome, 1 return):
	// the levelLink object is returned, which contains two fields:
    	// a.) prev: the name of the previous level. if it does not exist, value will be null 
    	// b.) next: the name of the next level. if it does not exist, value will be null
    const getPrevAndNext = (category, levelName) => {
        // first, let's get the array of mode objects belonging to category
        const isMisc = category === "misc" ? true : false;
        const modes = game.mode.filter(row => row.misc === isMisc);
		let found = false, prev = null;

        // define our obj containing the prev and next variables
        const levelLink = { prev: null, next: null };

        // iterate through each level to find the match, so we can determine previous and next
        for (let i = 0; i < modes.length; i++) {
            const levelArr = modes[i].level;

            for (let j = 0; j < levelArr.length; j++) {
				// extract information from level object
				const level = levelArr[j];
                const name = level.name, chartType = level.chart_type;

				// Special case #1: we found the match. set the found flag to true, and update the prev field in our
				// levelLink object
				if (name === levelName) {
					found = true;
					levelLink.prev = prev;
				}

				// Special case #2: we already found the level, and the current level has the chart type equal to { type } or "both"
				// in this case, update the next field in our levelLink object, and return it
				else if (found && (chartType === type || chartType === "both")) {
					levelLink.next = name;
					return levelLink;
				} 

				// General case: the level has not been found yet, and the current level is not a match. Update the prev variable
				// to the current level if the chart type is equal to { type } or "both".
				else {
					if (chartType === type || chartType === "both") {
						prev = name;
					}
				}
            }
        }
		// if the levelLink object has not been returned by this point, do it
		return levelLink;
    };

	// FUNCTION 2: insertPositionToLevelboard - for each submission, add the position field
    // PRECONDITIONS (1 parameter):
    // 1.) submissions: an array of submission objects, ordered in descending order by details.record, then in ascending order
    // by details.submitted_at
    // POSTCONDITIONS (1 possible outcome): 
    // each submission object in the submissions array is updated to include position field, which accurately ranks each record
    // based on the details.record field
    const insertPositionToLevelboard = submissions => {
        // variables used to determine position of each submission
        let trueCount = 1, posCount = trueCount;

        // now, iterate through each submission, and calculate the position
        submissions.forEach((submission, index) => {
            // update the position field
            submission.position = posCount;
            trueCount++;

            // if the next submission exists, and it's record is different from the current submission, update posCount to trueCount
            if (index < submissions.length-1 && submissions[index+1].details.record !== submission.details.record) {
                posCount = trueCount;
            }
        });
    };

	// FUNCTION 3: splitSubmissions - given an array of submissions, split submissions into live and all array
	// PRECONDITIONS (1 parameter):
	// 1.) submissions: an array of submissions objects, which must first be ordered by the current level name defined in the path.
	// also, it must be first ordered in descending order by the details.record field, then in ascending order by the details.submitted_at
	// field
	// POSTCONDITIONS (2 returns):
	// the function always has the same two returns:
	// 1.) all: the sorted array of submission objects that has all submission objects in the `submissions` array
	// 2.) live: the sorted array of submission objects that has only has objects whose details.live field are set to true
	const splitSubmissions = (submissions) => {
		// initialize variables used to split the submissions
		const live = [], all = [];

		// split board into two lists: live-only, and all records
		submissions.forEach(submission => {
			if (submission.details.live) {
				live.push({ ...submission, details: { ...submission.details } });
			}
			all.push(submission);
		});

		return { all: all, live: live };
	};

	// FUNCTION 4: setupBoard - given information about the path and the submissionReducer, set up the board object
	// PRECONDITIONS (2 parameters):
	// 1.) submissionReducer: an object with two fields:
		// a.) reducer: the submission reducer itself (state)
		// b.) dispatchSubmissions: the reducer function used to update the reducer
	// POSTCONDITIONS (2 possible outcome):
	// if the submissions successfully are retrieved, the list of submissions are generated, which is then split into two arrays: 
	// all and live. these arrays are used to set the records field of the board state, which is updated by calling the setBoard() function
	// if the submissions fail to be retrieved, an error message is rendered to the user, and the board state is NOT updated, leaving the
	// Levelboard component stuck loading
	const setupBoard = async (submissionReducer) => {
		// first, set board to default values, and get the names of the previous and next level
		setBoard(boardInit);
		const { prev, next } = getPrevAndNext(category, levelName);

		try {
			// get submissions, and filter based on the levelId
			const allSubmissions = await getSubmissions(game.abb, category, type, submissionReducer);
			const submissions = allSubmissions.filter(row => row.level.name === levelName).map(row => Object.assign({}, row));

			// split submissions into two arrays: all and live. [NOTE: this function will also update the form!]
			const { all, live } = splitSubmissions(submissions, game, type, levelName);

			// now, let's add the position field to each submission in both arrays
			insertPositionToLevelboard(all);
			insertPositionToLevelboard(live);

			// finally, update board state hook, as well as the userSubmission state hook
			setBoard({ ...board, records: { all: all, live: live }, adjacent: { prev: prev, next: next } });
			setUserSubmission(all.find(row => row.profile.id === user.profile.id));

		} catch (error) {
			// if the submissions fail to be fetched, let's render an error specifying the issue
			addMessage("Failed to fetch submission data. If refreshing the page does not work, the database may be experiencing some issues.", "error");
		}
	};

	// FUNCTION 5: handleTabClick - function that switches leaderboards based on the otherType parameter
	// PRECONDITIONS (1 parameter):
	// 1.) otherType: a string, either "score" or "time"
	// POSTCONDITIONS (2 possible outcome):
	// if otherType and type are the same, this function does nothing
	// otherwise, the user is navigated to the current level's other board
	const handleTabClick = otherType => {
		if (otherType !== type) {
			navigate(`/games/${ abb }/${ category }/${ otherType }/${ levelName }`);
		}
	};

	return {
		board,
		userSubmission,
		setupBoard,
		handleTabClick
	};
};  

/* ===== EXPORTS ===== */
export default Levelboard;