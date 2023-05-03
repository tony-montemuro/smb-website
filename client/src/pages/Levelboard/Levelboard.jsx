/* ===== IMPORTS ===== */
import "./Levelboard.css";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { StaticCacheContext, UserContext } from "../../Contexts";
import FrontendHelper from "../../helper/FrontendHelper";
import LevelboardLogic from "./Levelboard.js";
import LevelboardRow from "./LevelboardRow";
import FormPopup from "./FormPopup";
import PathHelper from "../../helper/PathHelper";
import ReportPopup from "./ReportPopup.jsx";
import DeletePopup from "./DeletePopup.jsx";

function Levelboard({ imageReducer, submissionReducer }) {
	/* ===== VARIABLES ===== */
	const navigate = useNavigate();
	const location = useLocation();
	const path = location.pathname.split("/");
	const abb = path[2];
	const category = path[3];
	const type = path[4];
	const levelName = path[5];
	const otherType = type === "score" ? "time" : "score";

	/* ===== CONTEXTS ===== */

	// static cache state from static cache context
  const { staticCache } = useContext(StaticCacheContext);

	// user state from user context
  const { user } = useContext(UserContext);

	/* ===== STATES & FUNCTIONS ===== */
	const [game, setGame] = useState(undefined);
	const [level, setLevel] = useState(undefined);
	const [levelboardState, setLevelboardState] = useState("live");
	const [submitPopup, setSubmitPopup] = useState(false);

	// states and functions from js file
	const { 
		board,
		form,
		setBoard,
		setupBoard,
		handleChange,
		setBoardDelete,
		setBoardReport,
		submitRecord
	} = LevelboardLogic();

	// helper functions
	const { capitalize, cleanLevelName } = FrontendHelper();
	const { fetchLevelFromGame } = PathHelper();

	/* ===== EFFECTS ===== */

	// code that is executed when the page loads, when the staticCache object is updated, or when the user
  // switches levels
	useEffect(() => {
		const games = staticCache.games;
		if (games.length > 0) {
			// see if abb corresponds to a game stored in cache
			const game = games.find(row => row.abb === abb);

			// if not, we will print an error message, and navigate to the home screen
			if (!game) {
				console.log("Error: Invalid game.");
				navigate("/");
				return;
			}

			// see if levelName corresponds to a level stored in the game object
			const level = fetchLevelFromGame(game, levelName, category);
			
			// if not, we will print an error message, and navigate to the home screen
			if (!level) {
				console.log("Error: Invalid level.");
				navigate("/");
				return;
			}

			// update state hooks corresponding to game and level
			setGame(game);
			setLevel(level);
			
			// set up the board object
			setupBoard(game, submissionReducer);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [staticCache, location.pathname]);

	/* ===== LEVELBOARD COMPONENT ===== */
	return game && level && board.records && form.values ?
		// Levelboard header - Contains general information about them game and board
		<>
			<div className="levelboard-header">

				{ /* Levelboard title - name of levelboard, as well as previous and next buttons */ }
				<div className="levelboard-title">

					{ /* Previous level button */ }
					{ board.adjacent.prev && 
						<Link to={ `/games/${ abb }/${ category }/${ type }/${ board.adjacent.prev }` }>
							<button disabled={ form.submitting }>←Prev</button>
						</Link>
					}

					{ /* Levelboard title */ }
					<h1>{ capitalize(type) }: { cleanLevelName(level.name) }</h1>

					{ /* Next level button */ }
					{ board.adjacent.next &&
					<Link to={ `/games/${ abb }/${ category }/${ type }/${ board.adjacent.next }` }>
						<button disabled={ form.submitting }>Next→</button>
					</Link>
					}
					
				</div>

				{ /* Levelboard buttons - contains many buttons related to the game that levelboard belongs to */ }
				<div className="levelboard-buttons">

					{ /* Button that pulls up the submission popup. NOTE: this button should only render if the user has a profile. */ }
					{ user.profile && <button onClick={ () => setSubmitPopup(true) }>Submit a { capitalize(type) }</button> }

					{ /* Button to navigate back to game page */ }
					<Link to={ `/games/${ abb }/${ category }` }>
						<button disabled={ form.submitting }>Back to Level Select</button>
					</Link>

					{ /* Button to navigate to the levelboard of the other type. NOTE: this only will be rendered if the
					chart_type field in the level state is set to "both" */ }
					{ level.chart_type === "both" &&
						<Link to={ `/games/${ abb }/${ category }/${ otherType }/${ level.name }` }>
							<button disabled={ form.submitting }>{ capitalize(otherType) } Board</button>
						</Link>
					}

					{ /* Button to navigate to the game's totalizer page. */ }
					<Link to={ `/games/${ abb }/${ category }/totalizer` }>
						<button disabled={ form.submitting }>Totalizer Table</button>
					</Link>

					{ /* Button to navigate to the game's medal table page. */ }
					<Link to={ `/games/${ abb }/${ category }/medals` }>
						<button disabled={ form.submitting }>Medal Table</button>
					</Link>

					{ /* All-live toggle: Toggles the levelboard between all and live, allowing both arrays of submissions to be rendered. */ }
					<label htmlFor="showLive">Live-{ type }s only: </label>
					<input
						id="showLive"
						type="checkbox"
						checked={ levelboardState === "live" ? true : false }
						onChange={ () => setLevelboardState(levelboardState === "live" ? "all" : "live") }
						disabled={ form.submitting }
					/>

				</div>
			</div>

			{ /* Levelboard container - div container wrapping the levelboard table */ }
			<div className="levelboard-container">
				<table>

					{ /* Table header information: specifies the information displayed in each cell of the board */ }
					<thead>
						<tr>
							<th>Position</th>
							<th>Name</th>
							<th>{ capitalize(type) }</th>
							<th>Date</th>
							<th>Region</th>
							<th>Monkey</th>
							<th>Proof</th>
							<th>Comment</th>
							<th>Approved</th>
							<th>Report</th>

							{ /* Delete header element should ONLY render if the current user is a moderator */ }
							{ user.is_mod ? <th>Delete</th> : null }
						</tr>
					</thead>

					{ /* Table body information - the submission data */ }
					<tbody>
						{ board.records[levelboardState].map((val) => {
							return <LevelboardRow 
								submission={ val } 
								imageReducer={ imageReducer } 
								reportFunc={ setBoardReport } 
								deleteFunc={ setBoardDelete } 
								key={ val.details.id } 
							/>
						})}
					</tbody>

				</table>
			</div>

			{ /* Popups */ }
			<DeletePopup board={ board } setBoard={ setBoard } />
			<ReportPopup board={ board } setBoard={ setBoard } />
			<FormPopup 
				form={ form }
				formPopup={ submitPopup } 
				setFormPopup={ setSubmitPopup } 
				game={ game }
				board={ board }
				handleChangeFunc={ handleChange }
				submitFunc={ submitRecord } 
			/>

		</>
	:

		// Loading component
		<p>Loading...</p>
};

/* ===== EXPORTS ===== */
export default Levelboard;