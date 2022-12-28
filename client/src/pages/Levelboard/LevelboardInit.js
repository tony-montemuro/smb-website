// imports 
import { useState } from "react";
import LevelboardHelper from "../../helper/LevelboardHelper";
import { supabase } from "../../components/SupabaseClient/SupabaseClient";
import { useNavigate } from "react-router-dom";
import FrontendHelper from "../../helper/FrontendHelper";

const LevelboardInit = () => {
	// variables
	const path = window.location.pathname;
	const pathArr = path.split("/");
	const abb = pathArr[2];
	const category = pathArr[3];
	const mode = pathArr[4];
	const levelId = pathArr[5];
	const formValuesInit = { 
		record: "", 
		monkeyId: 1,
		isLive: true, 
		proof: "", 
		comment: "" 
	};
	const currUserSubmissionInit = {
		user_id: null,
		game_id: abb,
		level_id: levelId,
		mode: mode,
		[mode]: null,
		name: null
	};

	// navigate used for redirecting
    const navigate = useNavigate();

	// react hooks
	const [loading, setLoading] = useState(true);
	const [recordsLoading, setRecordsLoading] = useState(true);
	const [records, setRecords] = useState({ all: [], live: [] });
	const [monkeys, setMonkeys] = useState([]);
	const [adjacent, setAdjacent] = useState(null);
	const [formValues, setFormValues] = useState(formValuesInit);
	const [formErrors, setFormErrors] = useState({});
	const [currentUserSubmission, setCurrentUserSubmission] = useState(currUserSubmissionInit);
	const [boardState, setBoardState] = useState("live");
	const [popup, setPopup] = useState(false);
	const [isSubmit, setIsSubmit] = useState(false);
	const [game, setGame] = useState(null);

	// helper functions
	const { addPositionToLevelboard, containsE, decimalCount } = LevelboardHelper();
	const { capitalize } = FrontendHelper();

	// FUNCTIONS
	// function that verifies user has navigated to a valid path
	const checkPath = async() => {
		try {
			// first, update formValues, currentUserSubmission, and boardState
			// these should be reset if the user has navigated to another level
			setFormValues(formValuesInit);
			setCurrentUserSubmission(currUserSubmissionInit);
			setBoardState("live");

			// next, verify the levelId is valid. this requires a query to supabase
			const { data: levelInfo, error, status } = await supabase
				.from("level")
				.select(`
					name,
					mode (game (name))
				`)
				.eq("game", abb)
				.eq("name", levelId)
				.in("chart_type", [`${mode}`, "both"])
				.single();

			// error handling
			if (error || status === 406) {
				throw error;
			}

			// finally, update react hooks
			const gameObj = { name: levelInfo.mode.game.name, abb: abb, category: category, mode: mode, levelName: levelInfo.name };
			setGame(gameObj);
			console.log(gameObj);

		} catch (error) {
			console.log(error.message);
			navigate("/");
		}
	};

	// function that queries all monkeys
	const queryMonkey = async() => {
		try {
			// query monkey table
			const { data: m, error, status } = await supabase
				.from("monkey")
				.select()
				.order("id")

			// error handling
			if (error && status !== 406) {
				throw error;
			}

			// update monkey hook
			setMonkeys(m);
			console.log(m);
		} catch(error) {
			console.log(error);
			alert(error.message);
		}
	};

	// function that queries submission table for relevant records
	const querySubmissions = async() => {
		try {
			// query submissions table
			let { data: board, error, status } = await supabase
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
			for (let i = 0; i < board.length; i++) {
				const currRecord = board[i];
				const timeStr = currRecord.submitted_at;
				const year = parseInt(timeStr.slice(0, 4));
				const month = parseInt(timeStr.slice(5, 7));
				const day = parseInt(timeStr.slice(8, 10));

				// firstly, if a user is currently signed in, check if a record belongs to them
				// if so, we need to update form values
				if (userId && currRecord.user_id === userId) {
					setFormValues({
						...formValues,
						record: currRecord[`${mode}`], 
						monkeyId: currRecord.monkey.id,
						isLive: currRecord["live"],
						proof: currRecord["proof"], 
						comment: currRecord["comment"],
					});
					setCurrentUserSubmission({
						...currentUserSubmission,
						user_id: currRecord.user_id,
						[mode]: currRecord[mode],
						name: currRecord.profiles.username
					});
				}

				// first, clean record object
				currRecord["avatar_url"] = currRecord.profiles.avatar_url;
				currRecord["country"] = currRecord.profiles.country;
				currRecord["name"] = currRecord.profiles.username;
				currRecord["monkey"] = currRecord.monkey.monkey_name;
				currRecord["year"] = year;
				currRecord["month"] = month;
				currRecord["day"] = day;
				delete currRecord["profiles"];

				// then, if we are looking at time records, fix the time field to 2 decimal points
				if (mode === 'time') {
					currRecord.time = currRecord.time.toFixed(2);
				}

				// finally, add to the liveOnly array if record is live. push to all array as well
				if (currRecord.live) {
					liveOnly.push(Object.assign({}, currRecord));
				}
				all.push(currRecord);
			}

			// now, let's add the position field to each record in both arrays
			addPositionToLevelboard(liveOnly, mode);
			addPositionToLevelboard(all, mode);

			// finally, update react hooks
			setRecords({ all: all, live: liveOnly });
			setRecordsLoading(false);
			console.log(liveOnly);
			console.log(all);

		} catch (error) {
			console.log(error);
			alert(error.message);
		} 
	};

	// function that makes query to determine the levels ajacent to levelId
	const getAdjacentLevelIds = async() => {
		try {
			// first, let's query all levels, whose chart type is equal to either
			// ${mode} or both, and whose game id is equal to abb
			const { data: levels, error, status } = await supabase
				.from("level")
				.select("name")
				.eq("game", abb)
				.eq("misc", category === "misc" ? true : false)
				.in("chart_type", [`${mode}`, "both"])
				.order("id");

			// error handling
			if (error && status !== 406) {
				throw error;
			}

			// from the list of levels, we need find out the levels adjacent to our current level
			const levelIndex = levels.findIndex(obj => obj.name === levelId);
			let prev = null, next = null;
			if (levelIndex > 0) {
				prev = levels[levelIndex-1].name;
			}
			if (levelIndex < levels.length-1) {
				next = levels[levelIndex+1].name;
			}

			// finally, update react hook
			const adj = { prev: prev, next: next };
			setAdjacent(adj);
			console.log(adj);

		} catch (error) {
			console.log(error.message);
			navigate("/");
		}
	};

	// function that runs each time a form value is changed. keeps the formValues
    // state updated
    const handleChange = (e) => {
        const { id, value, checked } = e.target;
        id === "isLive" ? setFormValues({ ...formValues, [id]: checked }) : setFormValues({...formValues, [id]: value });
        console.log(formValues);
    }

	// function that activates when the user submits the form. it first validates
    // the inputs before submitting
    const handleSubmit = (e) => {
        e.preventDefault();
        setFormErrors(validate(formValues));
        setIsSubmit(true);
    }

	// function that validates the inputs by the user
    const validate = (values) => {
        const errors = {};

        // first, validate the record.
        const record = values.record;
        if (!record) {
            errors.record = `${ capitalize(mode) } is required.`;
        }
        else if (record <= 0) {
            errors.record = `${ capitalize(mode) } must be a positive value.`;
        }
        else if (record > 2147483647) {
            errors.record = `${ capitalize(mode) } cannot exceed 2147483647.`;
        }

        // make sure scores are integers
        if (!Object.hasOwn(errors, 'record') && mode === 'score') {
            if (!Number.isInteger(+record)) {
                errors.record = "Score must be an integer value.";
            }
        }

        // make sure time has two decimal places
        if (!Object.hasOwn(errors, 'record') && mode === 'time') {
            if (decimalCount(record) !== 2) {
                errors.record = "Please ensure your submission has two decimal places.";
            }
            else if (containsE(record)) {
                errors.record = "Invalid character detected in submission. Please ensure submission has no letters.";
            }
        }

        // next, validate proof.
        if (!values.proof) {
            errors.proof = "Proof is required.";
        }

        // finally, validate the comment
        if (values.comment.length > 100) {
            errors.comment = "Comment must be 100 characters or less.";
        }

		console.log(errors);

        return errors;
    };

	// function that actually makes the query to database to perform submission
	const submit = async() => {
		try {
			console.log(formValues);
			const { error } = await supabase
				.from(`${mode}_submission`)
				.upsert({
					user_id: supabase.auth.user().id,
					game_id: game.abb,
					level_id: game.levelName,
					[mode]: formValues.record,
					monkey_id: formValues.monkeyId,
					proof: formValues.proof,
					comment: formValues.comment,
					live: formValues.isLive,
					approved: false
				}, {
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
		recordsLoading,
		game,
		records,
		monkeys,
		adjacent,
		formValues,
		formErrors,
		currentUserSubmission,
		boardState,
		popup,
		isSubmit,
		setLoading,
		setBoardState,
		setPopup,
		setIsSubmit,
		checkPath,
		queryMonkey,
		querySubmissions,
		getAdjacentLevelIds,
		submit,
		handleChange,
		handleSubmit
	};
};  

export default LevelboardInit;