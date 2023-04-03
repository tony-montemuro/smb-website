/* ===== IMPORTS ===== */
import { useContext, useState, useReducer } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../../Contexts";
import LevelboardHelper from "../../helper/LevelboardHelper";
import LevelboardUpdate from "../../database/update/LevelboardUpdate";
import SubmissionRead from "../../database/read/SubmissionRead";

const Levelboard = () => {
	/* ===== HELPER FUNCTIONS ===== */
	const { 
		validateLevelboardPath, 
		getPrevAndNext,
		insertPositionToLevelboard, 
		submission2Form, 
		dateF2B, 
		validateRecord,
		validateProof,
		validateComment,
		validateMessage,
		getDateOfSubmission,
		getSubmissionFromForm,
		handleNotification
	} = LevelboardHelper();
	const { getSubmissions } = SubmissionRead();
	const { submit } = LevelboardUpdate();

	/* ===== CONTEXTS ===== */

	// user state from user context
	const { user } = useContext(UserContext);

	/* ===== VARIABLES ===== */
	const pathArr = window.location.pathname.split("/");
	const abb = pathArr[2];
	const category = pathArr[3];
	const type = pathArr[4];
	const levelId = pathArr[5];
	const isMisc = category === "misc" ? true : false;
	const boardInit = { records: null, state: "live", update: null, report: null, delete: null };
	const formInit = { 
		values: null, 
		error: { record: null, proof: null, comment: null, message: null },
		monkey: null,
		region: null,
		prevSubmitted: false,
		submitting: false,
		submitted: false
	};

	/* ===== STATES AND REDUCERS ===== */
	const [loading, setLoading] = useState(true);
	const [game, setGame] = useState(null);
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

	/* ===== FUNCTIONS ===== */

	// navigate used for redirecting
    const navigate = useNavigate();

	// function that resets the state of the entire page
	const reset = () => {
		setLoading(true);
		dispatchForm({ field: "all" });
		setBoard(boardInit);
	};

	// function that takes the list of all games and levels, and generates a game object based on this information
	// it does this based on path information. if the path information is unable to generate a game object,
	// undefined will be returned. this will terminate the loading process immediately
	const generateGame = (games, allLevels) => {
		// determine the current game and level - used for path verification and state data
		const game = games.find(row => row.abb === abb);
		let level = null, levelIndex = null;
		const levels = allLevels.filter(row => row.game === abb && row.misc === isMisc);
		levels.forEach((row, index) => {
			if (row.name === levelId) {
				level = row;
				levelIndex = index;
			}
		});

		// check path
		const pathError = validateLevelboardPath(game, level);
		if (pathError) {
			console.log(pathError);
			navigate("/");
			return undefined;
		}

		// find the previous and next level indicies, and update game & form states
		const { prev, next } = getPrevAndNext(levelIndex, levels);
		const gameObj = {
			...game,
			category: category, 
			chart_type: level.chart_type, 
			level: level.name,
			adjacent: {
				prev: prev,
				next: next,
			},
			type: type,
			other: type === "score" ? "time" : "score"
		}

		// set the game state hook, and return the game object
		setGame(gameObj);
		dispatchForm({ field: "monkey", value: game.monkeys });
		dispatchForm({ field: "region", value: game.regions });
		return gameObj;
	};

	// function that takes a game object, and submissionReducer, and generates the levelboard
	const generateLevelboard = async (game, submissionReducer) => {		
		// get submissions, and filter based on the levelId
		let allSubmissions = await getSubmissions(abb, category, type, submissionReducer);
		const submissions = allSubmissions.filter(row => row.level.name === levelId).map(row => Object.assign({}, row));

		// initialize variables used to split the submissions
		const userId = user.id;
		const live = [], all = [];
		let newFormSet = false;

		// split board into two lists: live-only, and all records
		submissions.forEach(submission => {
			// if a user is currently signed in, check if a record belongs to them
			// if so, we need to update form values, and update the formSet flag
			if (userId && submission.user.id === userId) {
				const formData = submission2Form(submission, game, userId);
				dispatchForm({ field: "values", value: formData });
				dispatchForm({ field: "prevSubmitted", value: true });
				newFormSet = true;
			}

			// finally, add to the live array if record is live. push to all array as well
			if (submission.details.live) {
				live.push({ ...submission, details: { ...submission.details } });
			}
			all.push(submission);
		});

		// if the formSet flag was never set to true, this means that the client has not submitted to this chart
		// yet. set the form to default values
		if (!newFormSet) {
			const formData = submission2Form(undefined, game, userId ? userId : null);
			dispatchForm({ field: "values", value: formData });
		}

		// now, let's add the position field to each submission in both arrays
		insertPositionToLevelboard(all);
		insertPositionToLevelboard(live);

		// finally, update board state hook
		setBoard({ ...board, records: { all: all, live: live } });
	};

	// function that runs each time a form value is changed. keeps the form reducer updated
    const handleChange = e => {
        const { id, value, checked } = e.target;
		switch (id) {
			// case 1: live. this is a checkbox, so we need to use the "checked" variable as our value
			case "live":
				dispatchForm({ field: "values", value: { [id]: checked } });
				break;

			// case 2: user_id. this is a special field that only moderators are able to change. if a moderator is trying to update
			// a record from a user that has already submitted to the chart, the form will be loaded with that user's submission data. 
			// otherwise, the form is set to the default values
			case "user_id":
				const submission = board.records.all.find(row => row.user.id === value);
				console.log(submission);
				const formData = submission2Form(submission, game, value);
				dispatchForm({ field: "values", value: formData });
				break;

			// default case: simply update the id field of the values object with the value variable
			default:
				dispatchForm({ field: "values", value: { [id]: value } });
		}
		console.log(form);
    };

	// function that sets the report field of the board state when a user attempts to report a record
	// note: when this field is set to a non-null value, a popup component will automatically be activated
	const setBoardReport = id => {
		const row = board.records.all.find(row => row.user.id === id);
		setBoard({ ...board, report: {
			id: row.details.id,
			user_id: row.user.id,
			game_id: abb,
			level_id: levelId,
			type: type,
			username: row.user.username,
			record: row.details.record
		}});
	};

	// function that sets the delete field of the board state when a user attempts to delete a record
	// note: when this field is set to a non-null value, a popup component will automatically be activated
	const setBoardDelete = id => {
		const row = board.records.all.find(row => row.user.id === id);
		setBoard({ ...board, delete: {
			id: row.details.id,
			user_id: row.user.id,
			game_id: abb,
			level_id: levelId,
			type: type,
			username: row.user.username,
			record: row.details.record
		}});
	};

	// function that will validate the form. if form is valid, the data will be submitted to the database
	// if not, the function will return early, and update the error object
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
		console.log(error);
        dispatchForm({ field: "error", value: error });
		if (Object.values(error).some(e => e !== undefined)) {
            dispatchForm({ field: "submitting", value: false });
            return;
        }

		// finally, let's convert the date from the front-end format, to the backend format.
		const old = board.records.all.find(row => row.user.id === form.values.user_id);
		const backendDate = getDateOfSubmission(form.values.submitted_at, old, form.values.record, type);
		if (!backendDate) {
			dispatchForm({ field: "submitting", value: true });
			return;
		}

		// if we made it this far, no errors were detected, so we can go ahead and submit
		const id = dateF2B();
		const submission = getSubmissionFromForm(form.values, backendDate, id, board.records.all);
		await submit(submission);

		// next, handle notification
		handleNotification(form.values, id, user.id, levelId, type);

		// once all database updates have been finished, reload the page
		window.location.reload();
	};

	return {
		loading,
		game,
		board,
		form,
		setLoading,
		setBoard,
		reset,
		generateGame,
		generateLevelboard,
		handleChange,
		setBoardDelete,
		setBoardReport,
		submitRecord
	};
};  

/* ===== EXPORTS ===== */
export default Levelboard;