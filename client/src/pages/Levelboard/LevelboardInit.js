// imports 
import { useState, useReducer } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../database/SupabaseClient";
import LevelboardHelper from "../../helper/LevelboardHelper";
import LevelboardUpdate from "../../database/update/LevelboardUpdate";
import SubmissionRead from "../../database/read/SubmissionRead";

const LevelboardInit = () => {
	// helper functions
	const { 
		validateLevelboardPath, 
		insertPositionToLevelboard, 
		submission2Form, 
		dateF2B, 
		validateRecord,
		validateProof,
		validateComment,
		validateMessage,
		fixDateForSubmission,
		getPosition 
	} = LevelboardHelper();
	const { getSubmissions } = SubmissionRead();
	const { submit } = LevelboardUpdate();

	/* ===== VARIABLES ===== */
	
	const pathArr = window.location.pathname.split("/");
	const abb = pathArr[2];
	const category = pathArr[3];
	const type = pathArr[4];
	const levelId = pathArr[5];
	const isMisc = category === "misc" ? true : false;
	const boardInit = { records: null, adjacent: null, state: "live", update: null, delete: null };
	const formInit = { 
		values: null, 
		error: { record: null, proof: null, comment: null, message: null },
		monkey: null,
		region: null,
		prevSubmitted: false,
		submitting: false,
		submitted: false
	};
	const user = supabase.auth.user();

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

	// function that takes games, allLevels, and submissionReducer, and generates the levelboard based on the
	// abb and levelId
	const generateLevelboard = async (games, allLevels, submissionReducer) => {		
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
			return;
		}

		// find the previous and next level indicies, if they exist
		let prev = null, next = null;
		if (levelIndex > 0) {
			prev = levels[levelIndex-1].name;
		}
		if (levelIndex < levels.length-1) {
			next = levels[levelIndex+1].name;
		}

		// update game and form states
		const gameObj = {
			...game,
			category: category, 
			chart_type: level.chart_type, 
			levelName: level.name,
			type: type,
			other: type === "score" ? "time" : "score"
		}
		setGame(gameObj);
		dispatchForm({ field: "monkey", value: game.monkeys });
		dispatchForm({ field: "region", value: game.regions });

		// get submissions, and filter based on the levelId
		let allSubmissions = await getSubmissions(abb, category, type, submissionReducer);
		const submissions = allSubmissions.filter(row => row.level.name === levelId).map(row => Object.assign({}, row));

		// initialize variables used to split the submissions
		const userId = user ? user.id : null;
		const live = [], all = [];
		let newFormSet = false;

		// split board into two lists: live-only, and all records
		submissions.forEach(submission => {
			// if a user is currently signed in, check if a record belongs to them
			// if so, we need to update form values, and update the formSet flag
			if (userId && submission.user.id === userId) {
				const formData = submission2Form(submission, gameObj, userId);
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
			const formData = submission2Form(undefined, gameObj, userId ? userId : null);
			dispatchForm({ field: "values", value: formData });
		}

		// NEW - now, let's add the position field to each submission in both arrays
		insertPositionToLevelboard(live);
		insertPositionToLevelboard(all);

		// finally, update board state hook
		setBoard({ ...board, records: { all: all, live: live }, adjacent: { prev: prev, next: next } });
	};

	// function that runs each time a form value is changed. keeps the form reducer updated
    const handleChange = (e) => {
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

	// function that sets the delete field of the board state when a user attempts to delete a record
	// note: when this field is set to a non-null value, a popup component will automatically be activated
	const setBoardDelete = (id) => {
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
		error.message = validateMessage(form.values.message);

		// if any errors are determined, let's return
		console.log(error);
        dispatchForm({ field: "error", value: error });
		if (Object.values(error).some(e => e !== undefined)) {
            dispatchForm({ field: "submitting", value: false });
            return;
        }

		// finally, let's convert the date from the front-end format, to the backend format.
		const old = board.records.all.find(row => row.user.id === form.values.user_id);
		const backendDate = fixDateForSubmission(form.values.submitted_at, old, form.values.record, type);
		if (!backendDate) {
			dispatchForm({ field: "submitting", value: true });
			return;
		}

		// if we made it this far, no errors were detected, so we can go ahead and submit
		const id = dateF2B(), score = type === "score" ? true : false;
		const { message, ...formValsCopy } = form.values;
		formValsCopy.submitted_at = backendDate;
		formValsCopy.id = id;
		formValsCopy.score = score;
		formValsCopy.all_position = getPosition(formValsCopy.record, board.records.all);
		formValsCopy.position = formValsCopy.live ? getPosition(formValsCopy.record, board.records.live) : null;
		// console.log(formValsCopy);
		await submit(formValsCopy);

		// ===== THE NOTIFICATION SYSTEM WILL BE OVERHAULED; FOR NOW, COMMENT THIS ALL OUT ===== //

		// next, we need to determine if a notification is necessary. there are two cases where a notification needs to be created:
		// 1.) a moderator updates a preexisting submission
		// 2.) a moderator inserts a new submission on behalf of a player who had no previously submitted to the current chart
		// const submissionUserId = form.values.user_id;
		// if (user.id !== submissionUserId) {
		// 	// first, let's define our default notification object
		// 	let notification = {
		// 		user_id: submissionUserId,
		// 		game_id: abb,
		// 		level_id: levelId,
		// 		mod_id: user.id,
		// 		type: type,
		// 		message: message,
		// 		record: form.values[type],
		// 		submitted_at: backendDate,
		// 		region: form.values.region_id,
		// 		monkey: form.values.monkey_id,
		// 		proof: form.values.proof,
		// 		live: form.values.live
		// 	}

		// 	// if old is defined, moderator is UPDATING. update notification object accordingly. otherwise, simply
		// 	// set the notif_type field to insert
		// 	if (old) {
		// 		notification = {
		// 			...notification,
		// 			notif_type: "update",
		// 			old_record: form.values[type] !== old[type] ? old[type] : null,
		// 			old_submitted_at: backendDate !== old.submitted_at ? old.submitted_at : null,
		// 			old_region: form.values.region_id !== old.region.id ? old.region.id : null,
		// 			old_monkey: form.values.monkey_id !== old.monkey.id ? old.monkey.id : null,
		// 			old_proof: form.values.proof !== old.proof ? old.proof : null,
		// 			old_live: form.values.live !== old.live ? old.live : null
		// 		}
		// 	} else {
		// 		notification = { 
		// 			...notification,
		// 			notif_type: "insert"
		// 		};
		// 	}
			
		// 	// finally, insert the notification into the database
		// 	await insertNotification(notification);
		// }

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
		handleChange,
		setBoardDelete,
		submitRecord,
		generateLevelboard
	};
};  

export default LevelboardInit;