/* ===== IMPORTS ===== */
import { useContext, useState } from "react";
import { useLocation } from "react-router-dom";
import { GameContext } from "../../Contexts";
import SubmissionRead from "../../database/read/SubmissionRead";

const Levelboard = () => {
	/* ===== DATABASE FUNCTIONS ===== */
	const { getSubmissions } = SubmissionRead();

	/* ===== CONTEXTS ===== */

	// game state from game context
	const { game } = useContext(GameContext);

	/* ===== VARIABLES ===== */
	const location = useLocation();
	const path = location.pathname.split("/");
	const abb = path[2];
	const category = path[3];
	const type = path[4];
	const levelName = path[5];
	const boardInit = { records: null, report: null, delete: null };

	/* ===== STATES AND REDUCERS ===== */
	const [board, setBoard] = useState(boardInit);
	const [deleteSubmission, setDeleteSubmission] = useState(undefined);
	const [updatePopup, setUpdatePopup] = useState(null);

	/* ===== FUNCTIONS ===== */

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
	// POSTCONDITIONS (1 possible outcome):
	// the list of submissions are generated, which is then split into two arrays: all and live. these arrays
	// are used to set the records field of the board state, which is updated by calling the setBoard() function
	const setupBoard = async (submissionReducer) => {
		// first, let's get the names of the previous and next level
		const { prev, next } = getPrevAndNext(category, levelName);

		// get submissions, and filter based on the levelId
		let allSubmissions = await getSubmissions(game.abb, category, type, submissionReducer);
		const submissions = allSubmissions.filter(row => row.level.name === levelName).map(row => Object.assign({}, row));

		// split submissions into two arrays: all and live. [NOTE: this function will also update the form!]
		const { all, live } = splitSubmissions(submissions, game, type, levelName);

		// now, let's add the position field to each submission in both arrays
		insertPositionToLevelboard(all);
		insertPositionToLevelboard(live);

		// finally, update board state hook
		setBoard({ ...board, records: { all: all, live: live }, adjacent: { prev: prev, next: next } });
	};

	// FUNCTION 5: setBoardReport - sets the report field of the board state when user attempts to report a record
	// PRECONDITIONS (1 parameter):
	// 1.) id: an integer, representing the user's profile unique id. this parameter is used to find the record that belongs to that user
	// POSTCONDITIONS (1 possible outcome):
	// the record belonging to id is found, and this information is used to update the report field of the board state by calling
	// the setBoard() function. when this field is set to a non-null value, the report popup will render
	const setBoardReport = id => {
		const row = board.records.all.find(row => row.profile.id === id);
		setBoard({ ...board, report: {
			id: row.details.id,
			profile_id: row.profile.id,
			game_id: abb,
			level_id: levelName,
			type: type,
			username: row.profile.username,
			record: row.details.record
		}});
	};

	// FUNCTION 6: setDelete - sets the deleteSubmission state when moderator attempts to delete a record
	// PRECONDITIONS (1 parameter):
	// 1.) id: an integer, representing the user's profile unique id. this parameter is used to find the record that belongs to that user
	// POSTCONDITIONS (1 possible outcome):
	// the record belonging to id is found, and this information is used to update the deleteSubmission state by calling
	// the setDeleteSubmission() function. when this field is set to a non-null value, the delete popup will render
	const setDelete = id => {
		const row = board.records.all.find(row => row.profile.id === id);
		setDeleteSubmission({
			id: row.details.id,
			profile_id: row.profile.id,
			game_id: abb,
			level_id: levelName,
			type: type,
			username: row.profile.username,
			record: row.details.record
		});
	};

	// FUNCTION 7: setUpdate - function that is called user attempts to update a submission
	// PRECONDITIONS (1 parameter):
	// 1.) submission: a submission object. if a normal authenticated user is calling this function, it should ONLY be their own
	// submission. if a moderator calls this function, it can be any submission to the levelboard
	// POSTCONDITIONS (1 possible outcome):
	// the updatePopup state is updated by calling the setUpdatePopup() function
	const setUpdate = (submission) => {
		setUpdatePopup(submission);
	};

	return {
		board,
		deleteSubmission,
		updatePopup,
		setBoard,
		setupBoard,
		setDeleteSubmission,
		setDelete,
		setUpdate,
		setBoardReport
	};
};  

/* ===== EXPORTS ===== */
export default Levelboard;