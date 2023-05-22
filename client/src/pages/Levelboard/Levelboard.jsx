/* ===== IMPORTS ===== */
import "./Levelboard.css";
import { GameContext, UserContext } from "../../Contexts";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import DeletePopup from "../../components/DeletePopup/DeletePopup.jsx";
import FrontendHelper from "../../helper/FrontendHelper";
import LevelboardLogic from "./Levelboard.js";
import LevelboardRow from "./LevelboardRow";
import InsertPopup from "./InsertPopup.jsx";
import PathHelper from "../../helper/PathHelper";
import ReportPopup from "./ReportPopup.jsx";
import UpdatePopup from "./UpdatePopup.jsx";

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

	// user state from user context
  const { user } = useContext(UserContext);

	// game state from game context
  const { game } = useContext(GameContext);

	/* ===== STATES & FUNCTIONS ===== */
	const [level, setLevel] = useState(undefined);
	const [levelboardState, setLevelboardState] = useState("live");
	const [insertPopup, setInsertPopup] = useState(false);
	const [reportSubmission, setReportSubmission] = useState(undefined);
	const [updateSubmission, setUpdateSubmission] = useState(undefined);

	// states and functions from js file
	const { 
		board,
		deleteSubmission,
		setupBoard,
		setDeleteSubmission,
		setDelete
	} = LevelboardLogic();

	// helper functions
	const { capitalize, cleanLevelName } = FrontendHelper();
	const { fetchLevelFromGame } = PathHelper();

	/* ===== EFFECTS ===== */

	// code that is executed when the page loads, when the staticCache object is updated, or when the user
  // switches levels
	useEffect(() => {
		if (user !== undefined) {
			// see if levelName corresponds to a level stored in the game object
			const level = fetchLevelFromGame(game, levelName, category);
			
			// if not, we will print an error message, and navigate to the home screen
			if (!level) {
				console.log("Error: Invalid level.");
				navigate("/");
				return;
			}

			// update the level state hook
			setLevel(level);
			
			// set up the board object
			setupBoard(submissionReducer);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [user, location.pathname]);

	/* ===== LEVELBOARD COMPONENT ===== */
	return level && board.records ?
		// Levelboard header - Contains general information about them game and board
		<>
			<div className="levelboard-header">

				{ /* Levelboard title - name of levelboard, as well as previous and next buttons */ }
				<div className="levelboard-title">

					{ /* Previous level button */ }
					{ board.adjacent.prev && 
						<Link to={ `/games/${ abb }/${ category }/${ type }/${ board.adjacent.prev }` }>
							<button>←Prev</button>
						</Link>
					}

					{ /* Levelboard title */ }
					<h1>{ capitalize(type) }: { cleanLevelName(level.name) }</h1>

					{ /* Next level button */ }
					{ board.adjacent.next &&
					<Link to={ `/games/${ abb }/${ category }/${ type }/${ board.adjacent.next }` }>
						<button>Next→</button>
					</Link>
					}
					
				</div>

				{ /* Levelboard buttons - contains many buttons related to the game that levelboard belongs to */ }
				<div className="levelboard-buttons">

					{ /* Button that pulls up the submission popup. NOTE: this button should only render if the user has a profile. */ }
					{ user.profile && <button onClick={ () => setInsertPopup(true) }>Submit a { capitalize(type) }</button> }

					{ /* Button that pulls up the update submission popup. NOTE: this button should only render if the user has a profile,
					and a submission on the current levelboard. */ }
					{ user.profile && board.records.all.some(row => row.profile.id === user.profile.id) &&
						<button onClick={ () => setUpdateSubmission(board.records.all.find(row => row.profile.id === user.profile.id)) }>
							Update Submission
						</button>
					}

					{ /* Button to navigate to the levelboard of the other type. NOTE: this only will be rendered if the
					chart_type field in the level state is set to "both" */ }
					{ level.chart_type === "both" &&
						<Link to={ `/games/${ abb }/${ category }/${ otherType }/${ level.name }` }>
							<button>{ capitalize(otherType) } Board</button>
						</Link>
					}

				</div>

				{ /* Levelboard toggle - contains a toggle to switch the levelboard between the live and all states */ }
				<div className="levelboard-toggle">

					{ /* All-live toggle: Toggles the levelboard between all and live, allowing both arrays of submissions to be rendered. */ }
					<label htmlFor="showLive">Live-{ type }s only: </label>
					<input
						id="showLive"
						type="checkbox"
						checked={ levelboardState === "live" ? true : false }
						onChange={ () => setLevelboardState(levelboardState === "live" ? "all" : "live") }
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

							{ /* Update header element should ONLY render if the current user is a moderator */ }
							{ user && user.is_mod && <th>Update</th> }

							{ /* Delete header element should ONLY render if the current user is a moderator */ }
							{ user && user.is_mod && <th>Delete</th> }
						</tr>
					</thead>

					{ /* Table body information - the submission data */ }
					<tbody>
						{ board.records[levelboardState].map((val) => {
							return <LevelboardRow 
								submission={ val } 
								imageReducer={ imageReducer } 
								reportFunc={ setReportSubmission } 
								deleteFunc={ setDelete }
								updateFunc={ setUpdateSubmission }
								key={ val.details.id } 
							/>
						})}
					</tbody>

				</table>
			</div>

			{ /* Popups */ }
			<DeletePopup submission={ deleteSubmission } setSubmission={ setDeleteSubmission } />
			<ReportPopup submission={ reportSubmission } setSubmission={ setReportSubmission } />
			<InsertPopup 
				popup={ insertPopup } 
				setPopup={ setInsertPopup } 
				submissions={ board.records }
			/>
			<UpdatePopup
				submission={ updateSubmission }
				setSubmission={ setUpdateSubmission }
			/>

		</>
	:

		// Loading component
		<p>Loading...</p>
};

/* ===== EXPORTS ===== */
export default Levelboard;