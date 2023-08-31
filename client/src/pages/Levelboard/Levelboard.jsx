/* ===== IMPORTS ===== */
import "./Levelboard.css";
import { GameContext, MessageContext, UserContext } from "../../utils/Contexts";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import DetailPopup from "./DetailPopup.jsx";
import FiltersPopup from "./FiltersPopup.jsx";
import FrontendHelper from "../../helper/FrontendHelper";
import LevelboardLogic from "./Levelboard.js";
import LevelboardRow from "./LevelboardRow";
import InsertPopup from "./InsertPopup.jsx";
import PathHelper from "../../helper/PathHelper";
import UpdatePopup from "./UpdatePopup.jsx";

function Levelboard({ imageReducer, submissionCache }) {
	/* ===== CONTEXTS ===== */

	// user state from user context
  const { user } = useContext(UserContext);

	// game state from game context
  const { game } = useContext(GameContext);

	// add message function from message context
	const { addMessage } = useContext(MessageContext);

	/* ===== HELPER FUNCTIONS ===== */
	const { capitalize, cleanLevelName, dateB2F } = FrontendHelper();
	const { fetchLevelFromGame } = PathHelper();

	/* ===== VARIABLES ===== */
	const navigate = useNavigate();
	const location = useLocation();
	const path = location.pathname.split("/");
	const abb = path[2];
	const category = path[3];
	const type = path[4];
	const levelName = path[5];
	const defaultFilters = {
		endDate: dateB2F(),
		live: game.live_preference ? [true] : [false, true],
		monkeys: game.monkey.map(monkey => monkey.id),
		platforms: game.platform.map(platform => platform.id),
		obsolete: false,
		regions: game.region.map(region => region.id),
		tas: [false]
	};

	/* ===== STATES & FUNCTIONS ===== */
	const [level, setLevel] = useState(undefined);
	const [filtersPopup, setFiltersPopup] = useState(false);
	const [detailSubmission, setDetailSubmission] = useState(undefined);
	const [insertPopup, setInsertPopup] = useState(false);
	const [updateSubmissions, setUpdateSubmissions] = useState(undefined);

	// states and functions from js file
	const { 
		board,
		userSubmissions,
		setupBoard,
		applyFilters,
		handleTabClick
	} = LevelboardLogic();

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
			setupBoard(submissionCache);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [user, location.pathname]);

	// code that is executed once the board's initial data has loaded (`all` field, containing all submissions) has loaded,
	// or when the user switches levels
	useEffect(() => {
		if (board.all) {
			applyFilters(defaultFilters);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [board.all, location.pathname]);

	/* ===== LEVELBOARD COMPONENT ===== */
	return level && board.filtered && board.filters ?
		// Levelboard header - Contains general information about them game and board
		<div className="levelboard">
			<div className="levelboard-header">

				{ /* Levelboard title - name of levelboard, as well as previous and next buttons */ }
				<div className="levelboard-title">

					{ /* Previous level button */ }
					<div className="levelboard-title-btn">
						{ board.adjacent.prev && 
							<Link to={ `/games/${ abb }/${ category }/${ type }/${ board.adjacent.prev }` }>
								<button type="button">←Prev</button>
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
								<button type="button">Next→</button>
							</Link>
						}
					</div>
					
				</div>
			</div>

			{ /* Levelboard container - div container wrapping the levelboard table, as well as the type tabs. */ }
			<div className="levelboard-container">

				<div className="levelboard-options">

				{ /* Levelboard tabs: The type tabs for the levelboard. Will only render a tab if the level has a board for it. */ }
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

					{ /* Levelboard buttons - contains many buttons related to the game that levelboard belongs to */ }
					<div className="levelboard-buttons">

						{ /* Levelboard filters - contains a button to pull up the filters popup box */ }
						<button type="button" onClick={ () => setFiltersPopup(true) }>Filters</button>

						{ /* Button that pulls up the update submission popup. NOTE: this button should only render if the user has a profile,
						and at least 1 submission on the current levelboard. */ }
						{ user.profile && userSubmissions.length > 0 &&
							<button 
								type="button" 
								onClick={ () => setUpdateSubmissions(userSubmissions)}
							>
								Update Submission
							</button>
						}

						{ /* Button that pulls up the submission popup. NOTE: this button should only render if the user has a profile. */ }
						{ user.profile && 
							<button 
								type="button" 
								onClick={ () => setInsertPopup(true) }
							>
								Submit { capitalize(type) }
							</button>
						}

					</div>
				</div>

				{ /* Levelboard content: render the levelboard itself. */ }
				<div className="levelboard-content">
					<table>

						{ /* Table header information: specifies the information displayed in each cell of the board */ }
						<thead>
							<tr>
								<th>#</th>
								<th>Name</th>
								<th>{ capitalize(type) }</th>
								<th>Date</th>
								<th>Monkey</th>
								<th>Platform</th>
								<th>Region</th>
								<th></th>
								<th></th>
								<th></th>
							</tr>
						</thead>

						{ /* Table body information - the submission data */ }
						<tbody>
							{ board.filtered.map(submission => {
								return <LevelboardRow 
									submission={ submission } 
									imageReducer={ imageReducer } 
									onClickFunc={ setDetailSubmission }
									key={ submission.id } 
								/>
							})}
						</tbody>

					</table>
				</div>
			</div>

			{ /* Popups */ }
			<FiltersPopup
				popup={ filtersPopup }
				setPopup={ setFiltersPopup }
				currentFilters={ board.filters }
				defaultFilters={ defaultFilters }
				onApplyFunc={ applyFilters }
			/>
			<DetailPopup submission={ detailSubmission } setSubmission={ setDetailSubmission } />
			<InsertPopup 
				popup={ insertPopup } 
				setPopup={ setInsertPopup } 
				level={ level }
				submissions={ board.all }
			/>
			<UpdatePopup
				submissions={ updateSubmissions }
				setSubmissions={ setUpdateSubmissions }
			/>

		</div>
	:

		// Loading component
		<p>Loading...</p>
};

/* ===== EXPORTS ===== */
export default Levelboard;