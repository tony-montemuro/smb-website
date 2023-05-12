/* ===== IMPORTS ===== */
import { useContext, useState, useReducer } from "react";
import { useLocation } from "react-router-dom";
import { UserContext } from "../../Contexts";
import AllSubmissionUpdate from "../../database/update/AllSubmissionUpdate";
import LevelboardUtils from "./LevelboardUtils";
import SubmissionRead from "../../database/read/SubmissionRead";
import ValidationHelper from "../../helper/ValidationHelper";

const Levelboard = () => {
	/* ===== HELPER FUNCTIONS ===== */
	const {
		getPrevAndNext,
		insertPositionToLevelboard, 
		submission2Form, 
		dateF2B, 
		validateRecord,
		validateProof,
		validateComment,
		getDateOfSubmission,
		getSubmissionFromForm,
		handleNotification
	} = LevelboardUtils();
	const { validateMessage } = ValidationHelper();
	const { getSubmissions } = SubmissionRead();
	const { insertSubmission } = AllSubmissionUpdate();

	/* ===== CONTEXTS ===== */

	// user state from user context
	const { user } = useContext(UserContext);

	/* ===== VARIABLES ===== */
	const location = useLocation();
	const path = location.pathname.split("/");
	const abb = path[2];
	const category = path[3];
	const type = path[4];
	const levelName = path[5];
	const boardInit = { records: null, report: null, delete: null };
	const formInit = { 
		values: null, 
		error: { record: null, proof: null, comment: null, message: null },
		prevSubmitted: false,
		submitting: false,
		submitted: false
	};

	/* ===== STATES AND REDUCERS ===== */
	const [board, setBoard] = useState(boardInit);
	const [form, dispatchForm] = useReducer((state, action) => {
		switch(action.field) {
			case "values":
				return {
					...state,
					[action.field]: {
						...state[action.field],
						...action.value
					}
				};
			case "all":
				return formInit;
			default:
				return { ...state, [action.field]: action.value };
		}
	}, formInit);
	const [deleteSubmission, setDeleteSubmission] = useState(undefined);

	/* ===== FUNCTIONS ===== */

	// FUNCTION 1: splitSubmissionsAndUpdateForm - given an array of submissions, split submissions into live and all array. also,
	// if a submission belongs to the current user, update the form
	// PRECONDITIONS (2 parameters):
	// 1.) submissions: an array of submissions objects, which must first be ordered by the current level name defined in the path.
	// also, it must be first ordered in descending order by the details.record field, then in ascending order by the details.submitted_at
	// field
	// 2.) game: an object containing information about the game defined in the path
	// POSTCONDITIONS (2 returns, 2 possible outcomes):
	// the function always has the same two returns:
	// 1.) all: the sorted array of submission objects that has all submission objects in the `submissions` array
	// 2.) live: the sorted array of submission objects that has only has objects whose details.live field are set to true
	// the state of the form has two possible outcomes:
	// 1.) if their is no signed-in user, OR their does not exist a submission object belonging to the signed-in user, set the form
	// to default values
	// 2.) otherwise, set the form using the values in the submission object assigned to the signed-in user
	const splitSubmissionsAndUpdateForm = (submissions, game) => {
		// initialize variables used to split the submissions
		const profileId = user ? user.profile.id : null;
		const live = [], all = [];
		let formSet = false;

		// split board into two lists: live-only, and all records
		submissions.forEach(submission => {
			// if a user is currently signed in, check if a record belongs to them
			// if so, we need to update form values, and update the formSet flag
			if (profileId && submission.user.id === profileId) {
				const formData = submission2Form(submission, game, type, levelName, profileId);
				dispatchForm({ field: "values", value: formData });
				dispatchForm({ field: "prevSubmitted", value: true });
				formSet = true;
			}

			// finally, add to the live array if record is live. push to all array as well
			if (submission.details.live) {
				live.push({ ...submission, details: { ...submission.details } });
			}
			all.push(submission);
		});

		// if the formSet flag was never set to true, this means that the client has not submitted to this chart
		// yet. set the form to default values
		if (!formSet) {
			const formData = submission2Form(undefined, game, type, levelName, profileId ? profileId : null);
			dispatchForm({ field: "values", value: formData });
		}

		return { all: all, live: live };
	};

	// FUNCTION 2: setupBoard - given information about the path and the submissionReducer, set up the board object
	// PRECONDITIONS (2 parameters):
	// 1.) game: an object containing information about the game defined in the path
	// 2.) submissionReducer: an object with two fields:
		// a.) reducer: the submission reducer itself (state)
		// b.) dispatchSubmissions: the reducer function used to update the reducer
	// POSTCONDITIONS (1 possible outcome):
	// the list of submissions are generated, which is then split into two arrays: all and live. these arrays
	// are used to set the records field of the board state, which is updated by calling the setBoard() function
	const setupBoard = async (game, submissionReducer) => {
		// first, let's get the names of the previous and next level
		const { prev, next } = getPrevAndNext(game, category, levelName);

		// get submissions, and filter based on the levelId
		let allSubmissions = await getSubmissions(game.abb, category, type, submissionReducer);
		const submissions = allSubmissions.filter(row => row.level.name === levelName).map(row => Object.assign({}, row));

		// split submissions into two arrays: all and live. [NOTE: this function will also update the form!]
		const { all, live } = splitSubmissionsAndUpdateForm(submissions, game, type, levelName);

		// now, let's add the position field to each submission in both arrays
		insertPositionToLevelboard(all);
		insertPositionToLevelboard(live);

		// finally, update board state hook
		setBoard({ ...board, records: { all: all, live: live }, adjacent: { prev: prev, next: next } });
	};

	// FUNCTION 3: handleChange - function that is run each time the user modifies the submission form
	// PRECONDITIONS (2 parameters):
	// 1.) e: an event object generated when the user makes a change to the submission form
	// 2.) game: an object containing information about the game defined in the path
	// POSTCONDITIONS (3 possible outcomes):
	// if the field id is live, we use the checked variable rather than the value variable to update the form
	// if the field id is profile_id, we must update the entire form, since each user has completely different form data
	// otherwise, we simply update the form field based on the value variable
    const handleChange = (e, game) => {
        const { id, value, checked } = e.target;
		switch (id) {
			// case 1: live. this is a checkbox, so we need to use the "checked" variable as our value
			case "live":
				dispatchForm({ field: "values", value: { [id]: checked } });
				break;

			// case 2: profile_id. this is a special field that only moderators are able to change. if a moderator is trying to update
			// a record from a user that has already submitted to the chart, the form will be loaded with that user's submission data. 
			// otherwise, the form is set to the default values
			case "profile_id":
				console.log(board.records.all);
				const submission = board.records.all.find(row => row.user.id === parseInt(value));
				const formData = submission2Form(submission, game, type, levelName, value);
				dispatchForm({ field: "values", value: formData });
				break;

			// default case: simply update the id field of the values object with the value variable
			default:
				dispatchForm({ field: "values", value: { [id]: value } });
		};
    };

	// FUNCTION 4: setBoardReport - sets the report field of the board state when user attempts to report a record
	// PRECONDITIONS (1 parameter):
	// 1.) id: a string, representing the uuid user id of a user. this parameter is used to find the record that belongs to that user
	// POSTCONDITIONS (1 possible outcome):
	// the record belonging to id is found, and this information is used to update the report field of the board state by calling
	// the setBoard() function. when this field is set to a non-null value, the report popup will render
	const setBoardReport = id => {
		const row = board.records.all.find(row => row.user.id === id);
		setBoard({ ...board, report: {
			id: row.details.id,
			profile_id: row.user.id,
			game_id: abb,
			level_id: levelName,
			type: type,
			username: row.user.username,
			record: row.details.record
		}});
	};

	// FUNCTION 5: setDelete - sets the deleteSubmission state when moderator attempts to delete a record
	// PRECONDITIONS (1 parameter):
	// 1.) id: a string, representing the uuid user id of a user. this parameter is used to find the record that belongs to that user
	// POSTCONDITIONS (1 possible outcome):
	// the record belonging to id is found, and this information is used to update the deleteSubmission state by calling
	// the setDeleteSubmission() function. when this field is set to a non-null value, the delete popup will render
	const setDelete = id => {
		const row = board.records.all.find(row => row.user.id === id);
		setDeleteSubmission({
			id: row.details.id,
			profile_id: row.user.id,
			game_id: abb,
			level_id: levelName,
			type: type,
			username: row.user.username,
			record: row.details.record
		});
	};

	// FUNCTION 6: submitRecord - function that validates and submits a record to the database
	// PRECONDITIONS (1 parameter):
	// 1.) e: an event object generated when the user submits the submission form
	// POSTCONDITIONS (2 possible outcomes)
	// if the submission is validated, it is submitted to the database, as well as a notification, if necessary
	// and the page is reloaded
	// if not, the function will update the error field of the form state with any new form errors, and return early
	const submitRecord = async (e) => {
		// initialize submission
		e.preventDefault();
		dispatchForm({ field: "submitting", value: true });

		// create an error object that will store error messages for each field value that needs to
		// be validated
		const error = {};
		Object.keys(form.error).forEach(field => error[field] = undefined);

		// perform form validation
		error.record = validateRecord(form.values.record, type);
		error.proof = validateProof(form.values.proof);
		error.comment = validateComment(form.values.comment);
		error.message = validateMessage(form.values.message, false);

		// if any errors are determined, let's return
        dispatchForm({ field: "error", value: error });
		if (Object.values(error).some(e => e !== undefined)) {
            dispatchForm({ field: "submitting", value: false });
            return;
        }

		// finally, let's convert the date from the front-end format, to the backend format.
		const old = board.records.all.find(row => row.user.id === form.values.profile_id);
		const backendDate = getDateOfSubmission(form.values.submitted_at, old, form.values.record, type);
		if (!backendDate) {
			dispatchForm({ field: "submitting", value: true });
			return;
		}

		// if we made it this far, no errors were detected, so we can go ahead and submit
		const id = dateF2B();
		const submission = getSubmissionFromForm(form.values, backendDate, id, board.records.all);
		await insertSubmission(submission);

		// next, handle notification
		await handleNotification(form.values, id);

		// once all database updates have been finished, reload the page
		window.location.reload();
	};

	return {
		board,
		form,
		deleteSubmission,
		setBoard,
		setupBoard,
		setDeleteSubmission,
		handleChange,
		setDelete,
		setBoardReport,
		submitRecord
	};
};  

/* ===== EXPORTS ===== */
export default Levelboard;