/* ===== IMPORTS ===== */
import { useContext, useState } from "react";
import { useLocation } from "react-router-dom";
import { GameContext, MessageContext } from "../../Contexts";
import SubmissionRead from "../../database/read/SubmissionRead";

const Levelboard = () => {
	/* ===== CONTEXTS ===== */

	// game state from game context
	const { game } = useContext(GameContext);

	// add message function from message context
	const { addMessage } = useContext(MessageContext);

	/* ===== VARIABLES ===== */
	const location = useLocation();
	const path = location.pathname.split("/");
	const category = path[3];
	const type = path[4];
	const levelName = path[5];
	const boardInit = { records: null, report: null };

	/* ===== STATES ===== */
	const [board, setBoard] = useState(boardInit);
	const [deleteSubmission, setDeleteSubmission] = useState(undefined);

	/* ===== FUNCTIONS ===== */
	
	// database functions
	const { getSubmissions } = SubmissionRead();

	// FUNCTION 1: getPrevAndNext - get the previous and next level names
    // PRECONDTIONS (2 parameters):
    // 1.) category: the current category, either "main" or "misc", also defined in the path
    // 2.) levelName: a string corresponding to the name of a level, also defined in the path
    // POSTCONDITIONS (2 returns):
    // 1.) prev: the name of the previous level. if it does not exist, value will be null 
    // 2.) next: the name of the next level. if it does not exist, value will be null
    const getPrevAndNext = (category, levelName) => {
        // first, let's get the array of mode objects belonging to category
        const isMisc = category === "misc" ? true : false;
        const modes = game.mode.filter(row => row.misc === isMisc);

        // define our obj containing the prev and next variables
        const obj = { prev: null, next: null };

        // iterate through each level to find the match, so we can determine previous and next
        for (let i = 0; i < modes.length; i++) {
            const levelArr = modes[i].level;

            for (let j = 0; j < levelArr.length; j++) {
                const name = levelArr[j].name;
                if (name === levelName) {
                    // if the next element exists in the level array, set next to that.
                    // if NOT, now need to check if level array exists after current one. if so, set next to next array[0]
                    // if NOT EITHER, then next will remain set to null
                    obj.next = j+1 < levelArr.length ? levelArr[j+1].name : (i+1 < modes.length ? modes[i+1].level[0].name : null);
                    return obj;
                } else {
                    obj.prev = name;
                }
            }
        }
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

			// finally, update board state hook
			setBoard({ ...board, records: { all: all, live: live }, adjacent: { prev: prev, next: next } });

		} catch (error) {
			// if the submissions fail to be fetched, let's render an error specifying the issue
			addMessage("Failed to fetch submission data. If refreshing the page does not work, the database may be experiencing some issues.", "error");
		}
	};

	return {
		board,
		deleteSubmission,
		setupBoard,
		setDeleteSubmission
	};
};  

/* ===== EXPORTS ===== */
export default Levelboard;