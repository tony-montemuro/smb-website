/* ===== IMPORTS ===== */
import "./Levelboard.css";
import { GameContext, MessageContext, UserContext } from "../../utils/Contexts";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useContext, useEffect, useMemo, useState } from "react";
import Filters from "./Filters.jsx";
import FrontendHelper from "../../helper/FrontendHelper";
import Insert from "./Insert.jsx";
import LevelboardLogic from "./Levelboard.js";
import LevelboardRow from "./LevelboardRow";
import GameHelper from "../../helper/GameHelper";
import Popup from "../../components/Popup/Popup.jsx";
import RecentSubmissionsTable from "../../components/RecentSubmissionsTable/RecentSubmissionsTable.jsx";
import SubmissionDetails from "../../components/DetailPopup/SubmissionDetails.jsx";
import TableTabs from "../../components/TableTabs/TableTabs";
import Update from "./Update.jsx";

function Levelboard({ imageReducer }) {
	/* ===== CONTEXTS ===== */

	// user state & is moderator function from user context
  const { user, isModerator } = useContext(UserContext);

	// game state from game context
  const { game } = useContext(GameContext);

	// add message function from message context
	const { addMessage } = useContext(MessageContext);

	/* ===== HELPER FUNCTIONS ===== */
	const { capitalize, cleanLevelName, dateB2F } = FrontendHelper();
	const { fetchLevelFromGame } = GameHelper();

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
	const [insertPopup, setInsertPopup] = useState(false);
	const [updateSubmissions, setUpdateSubmissions] = useState(undefined);
	const [detailSubmission, setDetailSubmission] = useState(undefined);

	// states and functions from js file
	const { 
		board,
		userSubmissions,
		setupBoard,
		getChartTypes,
		handleTabClick,
		getChartSearchParams
	} = LevelboardLogic();

	/* ===== MEMOS ===== */
	const searchParams = useMemo(() => {
		return getChartSearchParams();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [abb, category, type, levelName]);

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
		<div className="levelboard">

			{ /* Popups */ }
			<Popup renderPopup={ insertPopup } setRenderPopup={ setInsertPopup } width={ `${ isModerator(abb) ? "50%" : "25%" }` }>
				<Insert level={ level } updateBoard={ setupBoard } />
			</Popup>
			<Popup renderPopup={ updateSubmissions } setRenderPopup={ setUpdateSubmissions } width={ "40%" } >
				<Update level={ level } updateBoard={ setupBoard } />
			</Popup>
			<Popup renderPopup={ filtersPopup } setRenderPopup={ setFiltersPopup } width={ "60%" } >
				<Filters currentFilters={ board.filters } defaultFilters={ defaultFilters } updateBoard={ setupBoard } />
			</Popup>
			<Popup renderPopup={ detailSubmission } setRenderPopup={ setDetailSubmission } width={ "40%" } >
				<SubmissionDetails level={ level } updateBoard={ setupBoard } />
			</Popup>

			{/* Levelboard header - Contains general information about them game and board */}
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
								Update Submission(s)
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

				{ /* Levelboard content: render the levelboard itself, as well as the recent submissions table. */ }
				<div className="levelboard-content">

					{ /* First, render the levelboard */ }
					<div className="levelboard-content-chart">
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

					{ /* Then, render the recent submissions table for this particular chart */ }
					<h2>Recent Submissions</h2>
					<RecentSubmissionsTable 
						renderGame={ false }
						renderLevelContext={ false }
						numSubmissions={ 20 }
						searchParams={ searchParams }
					/>

				</div>
			</div>

		</div>
	:

		// Loading component
		<p>Loading...</p>
};

/* ===== EXPORTS ===== */
export default Levelboard;