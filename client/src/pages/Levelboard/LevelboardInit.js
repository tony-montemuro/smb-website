// imports 
import { useState, useReducer } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../components/SupabaseClient/SupabaseClient";
import FrontendHelper from "../../helper/FrontendHelper";
import LevelboardHelper from "../../helper/LevelboardHelper";
import SubmissionQuery from "../../helper/SubmissionQuery";

const LevelboardInit = () => {
	/* ===== VARIABLES ===== */
	const pathArr = window.location.pathname.split("/");
	const abb = pathArr[2];
	const category = pathArr[3];
	const type = pathArr[4];
	const levelId = pathArr[5];
	const isMisc = category === "misc" ? true : false;
	const boardInit = { records: null, adjacent: null, state: "live", delete: null };
	const formInit = { 
		values: null, 
		error: { record: null, proof: null, comment: null },
		monkey: null,
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

	// helper functions
	const { capitalize } = FrontendHelper();
	const { addPositionToLevelboard, containsE, decimalCount } = LevelboardHelper();
	const { query } = SubmissionQuery();

	// navigate used for redirecting
    const navigate = useNavigate();

	// function that resets the state of the entire page
	const reset = () => {
		setLoading(true);
		dispatchForm({ field: "all" });
		setBoard(boardInit);
	};

	// function that takes games, levels, monkeys, and submissionState, and generates the levelboard based on the
	// abb and levelId
	const generateLevelboard = async (games, levels, monkeys, submissionState) => {		
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
		dispatchForm({ field: "monkey", value: monkeys });

		// from here, we have two cases. if user is accessing already cached submissions, we can fetch
        // this information from submissionState. Otherwise, we need to query, and set the submission state
        let submissions = {};
        if (submissionState.state && abb in submissionState.state) {
            submissions = submissionState.state[abb];
        } else {
            submissions = await query(abb, type);
            submissionState.setState({ ...submissionState.state, [abb]: submissions });
        }

		// now, filter the submissions object based on the levelId
		const filtered = submissions.filter(row => row.level.name === levelId).map(row => Object.assign({}, row));
		
		// split board into two lists: live-only, and all records
		const user = supabase.auth.user();
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
					live: currRecord.live,
					proof: currRecord.proof, 
					comment: currRecord.comment,
					user_id: currRecord.profiles.id,
					game_id: currentGame.abb,
					level_id: levelId,
					approved: false
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
			dispatchForm({ field: "values", value: {
				[type]: "", 
				monkey_id: 1,
				live: true,
				proof: "", 
				comment: "",
				user_id: userId,
				game_id: currentGame.abb,
				level_id: levelId,
				approved: false
			}});
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
		id === "live" ? dispatchForm({ field: "values", value: { [id]: checked } }) : dispatchForm({ field: "values", value: { [id]: value } });
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
	const submitRecord = async(e) => {
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

        // finally, validate the comment
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

		// if we made it this far, no errors were detected, so we can go ahead and submit
		try {
			const { error } = await supabase
				.from(`${type}_submission`)
				.upsert(form.values, {
                    returning: "minimal", // Don't return the value after inserting
                }, { 
                    onConflict: "user_id, game_id, level_id"
                });
				
				// error handling
				if (error) {
					throw error;
				}

				// if successful, reload the page
				window.location.reload();

		} catch(error) {
			console.log(error);
			alert(error.message);
		}
		
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