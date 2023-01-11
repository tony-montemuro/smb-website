// imports 
import { useState, useReducer } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../components/SupabaseClient/SupabaseClient";
import FrontendHelper from "../../helper/FrontendHelper";
import LevelboardHelper from "../../helper/LevelboardHelper";

const LevelboardInit = () => {
	/* ===== VARIABLES ===== */
	const pathArr = window.location.pathname.split("/");
	const abb = pathArr[2];
	const category = pathArr[3];
	const mode = pathArr[4];
	const levelId = pathArr[5];
	const boardInit = { records: null, adjacent: null, state: "live", delete: null };
	const formInit = { 
		values: null, 
		error: { record: null, proof: null, comment: null },
		monkey: null,
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
	const { addPositionToLevelboard, containsE, decimalCount } = LevelboardHelper();
	const { capitalize } = FrontendHelper();

	// navigate used for redirecting
    const navigate = useNavigate();

	// function that resets the state of the entire page
	const reset = () => {
		setLoading(true);
		dispatchForm({ field: "all" });
		setBoard(boardInit);
	};

	// function that verifies user has navigated to a valid path. this function will also establish the adjacent levels
	const checkPath = async() => {
		try {
			// first, verify the levelId is valid. this requires a query to supabase
			const { data: levels, error, status } = await supabase
				.from("level")
				.select(`
					name,
					mode (game (name)),
					chart_type
				`)
				.eq("game", abb)
				.eq("misc", category === "misc")
				.in("chart_type", [`${mode}`, "both"])
				.order("id");

			// error handling
			if (error || status === 406) {
				throw error;
			}
			if (levels.length === 0) {
				const error = { code: 1, message: "Error: This game and category combination have no levels." };
				throw error;
			}
			const levelIndex = levels.findIndex(obj => obj.name === levelId);
			if (levelIndex === -1) {
				const error = { code: 1, message: "Error: This level does not exist." };
				throw error;
			}

			// figure out previous and next ids
			let prev = null, next = null;
			if (levelIndex > 0) {
				prev = levels[levelIndex-1].name;
			}
			if (levelIndex < levels.length-1) {
				next = levels[levelIndex+1].name;
			}

			// finally, update react hooks
			const gameObj = { 
				name: levels[levelIndex].mode.game.name, 
				abb: abb, 
				category: category, 
				mode: mode,
				otherMode: mode === "score" ? "time" : "score",
				levelName: levels[levelIndex].name,
				chart_type: levels[levelIndex].chart_type
			};
			setGame(gameObj);
			setBoard({ ...board, adjacent: { prev: prev, next: next } });
			console.log(gameObj);

		} catch (error) {
			if (error.code === 1) {
				console.log(error.message);
			} else {
				console.log(error);
				alert(error.message);
			}
			navigate("/");
		}
	};

	// function that queries all monkeys
	const queryMonkey = async() => {
		try {
			// query monkey table
			const { data: monkeys, error, status } = await supabase
				.from("monkey")
				.select()
				.order("id")

			// error handling
			if (error && status !== 406) {
				throw error;
			}

			// update form reducer hook
			dispatchForm({ field: "monkey", value: monkeys });

		} catch(error) {
			console.log(error);
			alert(error.message);
		}
	};

	// function that queries submission table for relevant records
	const querySubmissions = async() => {
		try {
			// query submissions table
			let { data: table, error, status } = await supabase
				.from(`${mode}_submission`)
				.select(`
					user_id,
					profiles:user_id (username, country, avatar_url),
					${mode},
					monkey:monkey_id (id, monkey_name),
					submitted_at,
					proof,
					comment,
					live,
					approved
				`)
				.eq("game_id", abb)
				.eq("level_id", levelId)
				.order(`${mode}`, { ascending: false })
				.order("submitted_at", { ascending: true });
			
			// error handling
			if (error && status !== 406) {
				throw error;
			}

			// split board into two lists: live-only, and all records
			const user = supabase.auth.user();
			const userId = user ? user.id : null;
			const liveOnly = [], all = [];
			let formSet = false;
			for (let i = 0; i < table.length; i++) {
				const currRecord = table[i];

				// firstly, if a user is currently signed in, check if a record belongs to them
				// if so, we need to update form values, and update the formSet flag
				if (userId && currRecord.user_id === userId) {
					dispatchForm({ field: "values", value: {
						[mode]: currRecord[`${mode}`], 
						monkey_id: currRecord.monkey.id,
						live: currRecord["live"],
						proof: currRecord["proof"], 
						comment: currRecord["comment"],
						user_id: currRecord["user_id"],
						game_id: game.abb,
						level_id: levelId,
						approved: false
					}});
					formSet = true;
				}

				// next, if we are looking at time records, fix the time field to 2 decimal points
				if (mode === 'time') {
					currRecord.time = currRecord.time.toFixed(2);
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
					[mode]: "", 
					monkey_id: 1,
					live: true,
					proof: "", 
					comment: "",
					user_id: userId,
					game_id: game.abb,
					level_id: levelId,
					approved: false
				}});
			}

			// now, let's add the position field to each record in both arrays
			addPositionToLevelboard(liveOnly, mode);
			addPositionToLevelboard(all, mode);

			// finally, update board state hook
			setBoard({ ...board, records: { all: all, live: liveOnly } });

		} catch (error) {
			console.log(error);
			alert(error.message);
		} 
	};

	// function that runs each time a form value is changed. keeps the form reducer updated
    const handleChange = (e) => {
        const { id, value, checked } = e.target;
		id === "isLive" ? dispatchForm({ field: "values", value: { [id]: checked } }) : dispatchForm({ field: "values", value: { [id]: value } });
		console.log(form);
    };

	// function that sets the delete field of the board state when a user attempts to delete a record
	// note: when this field is set to a non-null value, a popup component will automatically be activated
	const setBoardDelete = (id) => {
		const row = board.records.all.find(row => row.user_id === id);
		setBoard({ ...board, delete: {
			user_id: row.user_id,
			game_id: abb,
			level_id: levelId,
			mode: mode,
			name: row.profiles.username,
			[mode]: row[mode]
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
		const record = form.values[mode];
		if (!record) {
            error.record = `${ capitalize(mode) } is required.`;
        }
        else if (record <= 0) {
            error.record = `${ capitalize(mode) } must be a positive value.`;
        }
        else if (record > 2147483647) {
            error.record = `${ capitalize(mode) } is invalid.`;
        }

		// make sure scores are integers
        if (!error.record && mode === 'score') {
            if (!Number.isInteger(+record)) {
                error.record = "Score must be an integer value.";
            }
        }

		// make sure time has two decimal places
        if (!error.record && mode === 'time') {
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
				.from(`${mode}_submission`)
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
		checkPath,
		queryMonkey,
		querySubmissions,
		handleChange,
		setBoardDelete,
		submitRecord
	};
};  

export default LevelboardInit;