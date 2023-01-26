// imports 
import { useState, useReducer } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../database/SupabaseClient";
import FrontendHelper from "../../helper/FrontendHelper";
import LevelboardHelper from "../../helper/LevelboardHelper";
import LevelboardUpdate from "../../database/update/LevelboardUpdate";
import SubmissionRead from "../../database/read/SubmissionRead";

const LevelboardInit = () => {
	/* ===== VARIABLES ===== */

	// helper functions
	const { capitalize } = FrontendHelper();
	const { addPositionToLevelboard, containsE, decimalCount, dateB2F, dateF2B } = LevelboardHelper();
	const { retrieveSubmissions } = SubmissionRead();
	const { submit } = LevelboardUpdate();

	const pathArr = window.location.pathname.split("/");
	const abb = pathArr[2];
	const category = pathArr[3];
	const type = pathArr[4];
	const levelId = pathArr[5];
	const isMisc = category === "misc" ? true : false;
	const boardInit = { records: null, adjacent: null, state: "live", update: null, delete: null };
	const formInit = { 
		values: null, 
		error: { record: null, proof: null, comment: null },
		monkey: null,
		region: null,
		prevSubmitted: false,
		submitting: false,
		submitted: false
	};
	const user = supabase.auth.user();
	const defaultFormVals = {
		[type]: "", 
		monkey_id: 1,
		live: true,
		proof: "", 
		comment: "",
		user_id: user ? user.id : undefined,
		game_id: abb,
		level_id: levelId,
		approved: false,
		submitted_at: dateB2F()
	}

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

	// function that takes games, levels, and submissionState, and generates the levelboard based on the
	// abb and levelId
	const generateLevelboard = async (games, levels, submissionState) => {		
		// first, we need to verify the path: start with game
		const currentGame = games.find(row => row.abb === abb);
		if (!currentGame) {
			console.log("Error: Invalid game.");
			navigate("/");
			return;
		}

		// next, we need to verify the level
		const gameLevels = levels.filter(row => row.game === abb && row.misc === isMisc);
		const level = gameLevels.map((row, index) => row.name === levelId ? { row, index } : null).filter(row => row !== null);
		if (level.length === 0) {
			console.log("Error: Invalid level.");
			navigate("/");
			return;
		}

		// find the previous and next level indicies, if they exist
		const levelInfo = level[0].row, levelIndex = level[0].index;
		let prev = null, next = null;
		if (levelIndex > 0) {
			prev = gameLevels[levelIndex-1].name;
		}
		if (levelIndex < gameLevels.length-1) {
			next = gameLevels[levelIndex+1].name;
		}

		// update game and form states
		setGame({ 
			...currentGame, 
			category: category, 
			chart_type: levelInfo.chart_type, 
			levelName: levelInfo.name,
			type: type,
			other: type === "score" ? "time" : "score"
		});
		dispatchForm({ field: "monkey", value: currentGame.monkeys });
		dispatchForm({ field: "region", value: currentGame.regions });

		// get submissions, and filter based on the levelId
        let submissions = await retrieveSubmissions(abb, type, submissionState);
		const filtered = submissions.filter(row => row.level.name === levelId).map(row => Object.assign({}, row));
		
		// split board into two lists: live-only, and all records
		const userId = user ? user.id : null;
		const liveOnly = [], all = [];
		let formSet = false;
		for (let i = 0; i < filtered.length; i++) {
			const currRecord = filtered[i];

			// firstly, if we are looking at time records, fix the time field to 2 decimal points
			if (type === 'time') {
				currRecord.time = currRecord.time.toFixed(2);
			}

			// next, if a user is currently signed in, check if a record belongs to them
			// if so, we need to update form values, and update the formSet flag
			if (userId && currRecord.profiles.id === userId) {
				dispatchForm({ field: "values", value: {
					[type]: currRecord[`${ type }`], 
					monkey_id: currRecord.monkey.id,
					region_id: currRecord.region.id,
					live: currRecord.live,
					proof: currRecord.proof, 
					comment: currRecord.comment,
					user_id: currRecord.profiles.id,
					game_id: currentGame.abb,
					level_id: levelId,
					approved: false,
					submitted_at: dateB2F(currRecord.submitted_at)
				}});
				dispatchForm({ field: "prevSubmitted", value: true });
				formSet = true;
			}

			// finally, add to the liveOnly array if record is live. push to all array as well
			if (currRecord.live) {
				liveOnly.push(Object.assign({}, currRecord));
			}
			all.push(currRecord);
		}

		// if the formSet flag was never set to true, this means that the client has not submitted to this chart
		// yet. set the form to default values
		if (!formSet) {
			dispatchForm({ field: "values", value: { ...defaultFormVals, region_id: currentGame.regions[0].id } });
		}

		// now, let's add the position field to each record in both arrays
		addPositionToLevelboard(liveOnly, type);
		addPositionToLevelboard(all, type);

		// finally, update board state hook
		setBoard({ ...board, records: { all: all, live: liveOnly }, adjacent: { prev: prev, next: next } });
	};

	// function that runs each time a form value is changed. keeps the form reducer updated
    const handleChange = (e) => {
        const { id, value, checked } = e.target;
		switch (id) {
			// case 1: live. this is a checkbox, so we need to use the "checked" variable as our value
			case "live":
				dispatchForm({ field: "values", value: { [id]: checked } });
				break;

			// case 2: user_id. this is a special field that only moderators are able to change. if a user is trying to update
			// a record from a user that has already submitted to the chart, the form will be loaded with that user's submission data. 
			// otherwise, the form is set to the default values
			case "user_id":
				const record = board.records.all.find(row => row.profiles.id === value);
				if (record) {
					dispatchForm({ field: "values", value: {
						user_id: value,
						game_id: abb,
						level_id: levelId,
						[type]: record[type],
						submitted_at: dateB2F(record.submitted_at),
						monkey_id: record.monkey.id,
						proof: record.proof,
						comment: record.comment,
						live: record.live,
						approved: record.approved
					}});
				} else {
					dispatchForm({ field: "values", value: { ...defaultFormVals, user_id: value, region_id: game.regions[0].id } });
				}
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
		const row = board.records.all.find(row => row.profiles.id === id);
		console.log(id);
		setBoard({ ...board, delete: {
			user_id: row.profiles.id,
			game_id: abb,
			level_id: levelId,
			type: type,
			name: row.profiles.username,
			[type]: row[type]
		}});
	};

	// function that will validate the form. if form is valid, the data will be submitted to the database
	// if not, the function will return early, and update the error object
	const submitRecord = async (e) => {
		// initialize submission
		e.preventDefault();
		dispatchForm({ field: "submitting", value: true });
		const error = {};
		Object.keys(form.error).forEach(field => error[field] = null);

		// first, validate the record
		const record = form.values[type];
		if (!record) {
            error.record = `${ capitalize(type) } is required.`;
        }
        else if (record <= 0) {
            error.record = `${ capitalize(type) } must be a positive value.`;
        }
        else if (record > 2147483647) {
            error.record = `${ capitalize(type) } is invalid.`;
        }

		// make sure scores are integers
        if (!error.record && type === 'score') {
            if (!Number.isInteger(+record)) {
                error.record = "Score must be an integer value.";
            }
        }

		// make sure time has two decimal places
        if (!error.record && type === 'time') {
            if (decimalCount(record) !== 2) {
                error.record = "Please ensure your submission has two decimal places.";
            }
            else if (containsE(record)) {
                error.record = "Invalid character detected in submission. Please ensure submission has no letters.";
            }
        }

		// next, validate proof.
        if (!form.values.proof) {
            error.proof = "Proof is required.";
        }

        // next, validate the comment
        if (form.values.comment.length > 100) {
            error.comment = "Comment must be 100 characters or less.";
        }

		// if any errors are determined, let's return
		console.log(error);
        dispatchForm({ field: "error", value: error });
		if (Object.values(error).some(e => e != null)) {
            dispatchForm({ field: "submitting", value: false });
			console.log("failed");
            return;
        }

		// finally, let's convert the date from the front-end format, to the backend format. this involves some complex logic, comments
		// will attempt to explain
		let backendDate = undefined;
		const oldSubmissionData = board.records.all.find(row => row.profiles.id === form.values.user_id);
		const currDate = dateB2F();

		// first, we need to handle defining the date differently if the user has a previous submissions
		if (oldSubmissionData) {
			const prevDate = dateB2F(oldSubmissionData.submitted_at);

			// special case: user is attempting to submit a new { type }, but has either forgotten to change the date of their old submission,
			// or has deliberately not changed it. give them a confirmation box to ensure they have not made a mistake. if they hit 'no', the submission
			// process will cancel. otherwise, continue.
			if (form.values.submitted_at === prevDate && form.values[game.type] !== oldSubmissionData[game.type]) {
				if (!window.confirm(`You are attempting to submit a new ${ game.type } with the same date as the previous submission. Are you sure this is correct?`)) {
					dispatchForm({ field: "submitting", value: false });
					return;
				}
			}

			// CASE 1: the submission date from the form is equal to the submission date in the backend. in this case, backendDate is just date
			// from previous submission data
			if (form.values.submitted_at === prevDate) {
				backendDate = oldSubmissionData.submitted_at;
			}
		} 
		if (!backendDate) {
			// CASE 2: the submission date from the form is equal to the current date. in this case, return the default call to the
			// function converting dates from front-end format to back-end format
			if (form.values.submitted_at === currDate) {
				backendDate = dateF2B();
			} 
			
			// CASE 3: the submission date from the form is NOT EQUAL to current date, AND was NOT EQUAL to the date from a previous submission
			// in this case, return the call to function converting dates from front-end format to back-end format, with form date as a parameter
			else {
				backendDate = dateF2B(form.values.submitted_at);
			}
		}

		// if we made it this far, no errors were detected, so we can go ahead and submit
		await submit(type, { ...form.values, submitted_at: backendDate });
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