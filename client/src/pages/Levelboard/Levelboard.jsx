/* ===== IMPORTS ===== */
import "./Levelboard.css";
import { GameContext, MessageContext, UserContext } from "../../Contexts";
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

	/* ===== CONTEXTS ===== */

	// user state from user context
  const { user } = useContext(UserContext);

	// game state from game context
  const { game } = useContext(GameContext);

	// add message function from message context
	const { addMessage } = useContext(MessageContext);

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
		handleTabClick
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
			const level = fetchLevelFromGame(game, levelName, category, type);
			
			// if not, we will print an error message, and navigate to the home screen
			if (!level) {
				addMessage("Chart does not exist.", "error");
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
					<div className="levelboard-title-btn">
						{ board.adjacent.prev && 
							<Link to={ `/games/${ abb }/${ category }/${ type }/${ board.adjacent.prev }` }>
								<button>←Prev</button>
							</Link>
						}
					</div>

					{ /* Levelboard title */ }
					<div className="levelboard-title-name">
						<h1>{ cleanLevelName(level.name) }</h1>
					</div>

					{ /* Next level button */ }
					<div className="levelboard-title-btn">
						{ board.adjacent.next &&
							<Link to={ `/games/${ abb }/${ category }/${ type }/${ board.adjacent.next }` }>
								<button>Next→</button>
							</Link>
						}
					</div>
					
				</div>

				{ /* Levelboard buttons - contains many buttons related to the game that levelboard belongs to */ }
				<div className="levelboard-buttons">

					{ /* Button that pulls up the submission popup. NOTE: this button should only render if the user has a profile. */ }
					{ user.profile && 
						<button 
							type="button" 
							onClick={ () => setInsertPopup(true) }
							disabled={ board.records.all.some(row => row.profile.id === user.profile.id && row.report) }
						>
							Submit { capitalize(type) }
						</button>
					}

					{ /* Button that pulls up the update submission popup. NOTE: this button should only render if the user has a profile,
					and a submission on the current levelboard. */ }
					{ user.profile && board.records.all.some(row => row.profile.id === user.profile.id) &&
						<button type="button" onClick={ () => setUpdateSubmission(board.records.all.find(row => row.profile.id === user.profile.id)) }>
							Update Submission
						</button>
					}

				</div>

				{ /* Levelboard toggle - contains a toggle to switch the levelboard between the live and all states */ }
				<div className="levelboard-toggle">

					{ /* All-live toggle: Toggles the levelboard between all and live, allowing both arrays of submissions to be rendered. */ }
					<label htmlFor="showLive">Live-{ type }s only: </label>
					<input
						id="showLive"
						type="checkbox"
						checked={ levelboardState === "live" }
						onChange={ () => setLevelboardState(levelboardState === "live" ? "all" : "live") }
					/>

				</div>
			</div>

			{ /* Levelboard container - div container wrapping the levelboard table, as well as the type tabs. */ }
			<div className="levelboard-container">

				{ /* Levelboard tabs: The type tabs for the levelboard. Will only render a tab if the level has a board for it. */ }
				<div className="levelboard-tabs-wraper">
					<div className="levelboard-tabs">

						{ /* Render a score tab if the chart type is score or both */ }
						{ level.chart_type !== "time" &&
							<div
								className={ `levelboard-tab ${ type === "score" ? "levelboard-tab-active" : "" }` }
								onClick={ () => handleTabClick("score") }
							>
								Score
							</div>
						}

						{ /* Render a time tab if the chart type is time or both */ }
						{ level.chart_type !== "score" && 
							<div
								className={ `levelboard-tab ${ type === "time" ? "levelboard-tab-active" : "" }` }
								onClick={ () => handleTabClick("time") }
							>
								Time
							</div>
						}

					</div>
				</div>

				{ /* Levelboard content: render the levelboard itself. */ }
				<div className="levelboard-content">
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

								{ /* Report header element should ONLY render if the current user is authenticated */ }
								{ user.id && <th>Report</th> }

								{ /* Update header element should ONLY render if the current user is a moderator */ }
								{ user.is_mod && <th>Update</th> }

								{ /* Delete header element should ONLY render if the current user is a moderator */ }
								{ user.is_mod && <th>Delete</th> }
								
							</tr>
						</thead>

						{ /* Table body information - the submission data */ }
						<tbody>
							{ board.records[levelboardState].map((val) => {
								return <LevelboardRow 
									submission={ val } 
									imageReducer={ imageReducer } 
									reportFunc={ setReportSubmission } 
									deleteFunc={ setDeleteSubmission }
									updateFunc={ setUpdateSubmission }
									key={ val.details.id } 
								/>
							})}
						</tbody>

					</table>
				</div>
			</div>

			{ /* Popups */ }
			<DeletePopup submission={ deleteSubmission } setSubmission={ setDeleteSubmission } />
			<ReportPopup submission={ reportSubmission } setSubmission={ setReportSubmission } />
			<InsertPopup 
				popup={ insertPopup } 
				setPopup={ setInsertPopup } 
				submissions={ board.records.all }
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