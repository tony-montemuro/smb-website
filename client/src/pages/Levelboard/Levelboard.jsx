/* ===== IMPORTS ===== */
import "./Levelboard.css";
import { GameContext, MessageContext, UserContext } from "../../utils/Contexts";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import DetailPopup from "../../components/DetailPopup/DetailPopup.jsx";
import FiltersPopup from "./FiltersPopup.jsx";
import FrontendHelper from "../../helper/FrontendHelper";
import LevelboardLogic from "./Levelboard.js";
import LevelboardRow from "./LevelboardRow";
import InsertPopup from "./InsertPopup.jsx";
import PathHelper from "../../helper/PathHelper";
import TableTabs from "../../components/TableTabs/TableTabs";
import UpdatePopup from "./UpdatePopup.jsx";

function Levelboard({ imageReducer }) {
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
	// states
	const [level, setLevel] = useState(undefined);
	const [filtersPopup, setFiltersPopup] = useState(false);
	const [insertPopup, setInsertPopup] = useState(false);
	const [updateSubmissions, setUpdateSubmissions] = useState(undefined);
	const [detailSubmission, setDetailSubmission] = useState(undefined);

	// states and functions from js file
	const { 
		board,
		userSubmissions,
		setupBoard,
		applyFilters,
		getChartTypes,
		handleTabClick
	} = LevelboardLogic();

	// FUNCTION 1: closePopups - general function that executes when user attempts to close a popup
	// PRECONDITIONS (1 parameter):
	// 1.) hasChanged - boolean variable that should be set to true when user's popup closure is a result of a change to db
	// POSTCONDITIONS (2 possible outcome):
	// if isChanged is false, simply close all popups
	// otherwise, we want to re-setup the board with the updated data, and close popups
	const closePopups = async hasChanged => {
		if (hasChanged) {
			await setupBoard(board.filters);
		}
		setFiltersPopup(null);
		setInsertPopup(null);
		setUpdateSubmissions(null);
		setDetailSubmission(null);
	};

	/* ===== EFFECTS ===== */

	// code that is executed when the page loads, when the user state is updated, or when the user
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
			setupBoard(defaultFilters);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [user, location.pathname]);

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
					<TableTabs elements={ getChartTypes(level) } current={ type } handleClick={ handleTabClick } />

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
									level={ level }
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
				closePopup={ closePopups }
				currentFilters={ board.filters }
				defaultFilters={ defaultFilters }
				onApplyFunc={ applyFilters }
			/>
			<DetailPopup 
				submission={ detailSubmission } 
				closePopup={ closePopups }
				level={ level }
			/>
			<InsertPopup 
				popup={ insertPopup } 
				closePopup={ closePopups } 
				level={ level }
			/>
			<UpdatePopup
				submissions={ updateSubmissions }
				setSubmissions={ setUpdateSubmissions }
				level={ level }
			/>

		</div>
	:

		// Loading component
		<p>Loading...</p>
};

/* ===== EXPORTS ===== */
export default Levelboard;