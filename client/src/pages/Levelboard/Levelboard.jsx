/* ===== IMPORTS ===== */
import { GameContext, MessageContext, UserContext } from "../../utils/Contexts";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useContext, useEffect, useMemo, useState } from "react";
import styles from "./Levelboard.module.css";
import Container from "../../components/Container/Container.jsx";
import Filters from "./Filters/Filters.jsx";
import FrontendHelper from "../../helper/FrontendHelper";
import Insert from "./Insert/Insert.jsx";
import LevelboardLogic from "./Levelboard.js";
import LevelboardRow from "./LevelboardRow";
import LoadingTable from "../../components/LoadingTable/LoadingTable.jsx";
import GameHelper from "../../helper/GameHelper";
import Loading from "../../components/Loading/Loading.jsx";
import Popup from "../../components/Popup/Popup.jsx";
import RecentSubmissionsTable from "../../components/RecentSubmissionsTable/RecentSubmissionsTable.jsx";
import SubmissionDetails from "../../components/SubmissionDetails/SubmissionDetails.jsx";
import TableContent from "../../components/TableContent/TableContent.jsx";
import TableTabs from "../../components/TableTabs/TableTabs";
import Update from "./Update/Update.jsx";

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
	const buttonWidth = "60px";
	const TABLE_WIDTH = 10;
	const NUM_RECENT = 20;

	/* ===== STATES & FUNCTIONS ===== */
	const [level, setLevel] = useState(undefined);
	const [filtersPopup, setFiltersPopup] = useState(false);
	const [insertPopup, setInsertPopup] = useState(false);
	const [updateSubmissions, setUpdateSubmissions] = useState(undefined);
	const [detailSubmission, setDetailSubmission] = useState(undefined);
	const [submitting, setSubmitting] = useState(false);

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
	return level ?
		<div className={ styles.levelboard }>

			{ /* Popups */ }
			<Popup 
				renderPopup={ insertPopup } 
				setRenderPopup={ setInsertPopup } 
				width={ `${ isModerator(abb) ? "1000px" : "500px" }` } 
				disableClose={ submitting }
			>
				<Insert level={ level } updateBoard={ setupBoard } submitting={ submitting } setSubmitting={ setSubmitting } />
			</Popup>
			<Popup renderPopup={ updateSubmissions } setRenderPopup={ setUpdateSubmissions } width="800px" disableClose={ submitting } >
				<Update level={ level } updateBoard={ setupBoard } submitting={ submitting } setSubmitting={ setSubmitting } />
			</Popup>
			<Popup renderPopup={ filtersPopup } setRenderPopup={ setFiltersPopup } width="1100px" >
				<Filters currentFilters={ board.filters } defaultFilters={ defaultFilters } updateBoard={ setupBoard } />
			</Popup>
			<Popup renderPopup={ detailSubmission } setRenderPopup={ setDetailSubmission } width="40%" >
				<SubmissionDetails level={ level } updateBoard={ setupBoard } />
			</Popup>

			<Container>

				{ /* Levelboard title - name of levelboard, as well as previous and next buttons */ }
				<div className={ `center ${ styles.title}` }>

					{ /* Previous level button */ }
					{ board.adjacent && board.adjacent.prev ?
							<Link to={ `/games/${ abb }/${ category }/${ type }/${ board.adjacent.prev }` }>
								<button type="button">←Prev</button>
							</Link>
						:
							<div style={ { width: buttonWidth } }></div>
					}

					{ /* Level name */ }
					<div className={ `center ${ styles.middleTitle }` }>
						<h1>{ cleanLevelName(level.name) }</h1>
					</div>

					{ /* Next level button */ }
					{ board.adjacent && board.adjacent.next ?
							<Link to={ `/games/${ abb }/${ category }/${ type }/${ board.adjacent.next }` }>
								<button type="button">Next→</button>
							</Link>
						:
							<div style={ { width: buttonWidth } }></div>
					}

				</div>

				{ /* Levelboard options - render the type tabs, as well as filter, update, and submit buttons (if applicable) */ }
				<div className={ styles.options }>

					{ /* Render type tabs to switch between score and time charts */ }
					<TableTabs elements={ getChartTypes(level) } current={ type } handleClick={ handleTabClick } />

					{ /* Render buttons, such as: filters, update, insert */ }
					{ board.filtered && board.filters ?
							<div className={ styles.optionsBtns }>
								<button type="button" onClick={ () => setFiltersPopup(true) }>Filters</button>
								{ user.profile && userSubmissions.length > 0 &&
									<button 
										type="button" 
										onClick={ () => setUpdateSubmissions(userSubmissions)}
									>
										Update Submission(s)
									</button>
								}
								{ user.profile && 
									<button 
										type="button" 
										onClick={ () => setInsertPopup(true) }
									>
										Submit { capitalize(type) }
									</button>
								}
							</div>
						:
							<Loading />
					}	

				</div>

				{ /* Levelboard chart - render the submissions for this chart */ }
				<div className={ styles.chart }>
					<div className="table">
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
								{ board.filtered && board.filters ?
									<TableContent 
										items={ board.filtered } 
										emptyMessage={ board.all.length > 0 ? "No submissions match your filters." : "There have been no submissions to this chart." }
										numCols={ TABLE_WIDTH }
									>
										{ board.filtered.map(submission => {
											return <LevelboardRow 
												submission={ submission } 
												imageReducer={ imageReducer }
												level={ level }
												onClickFunc={ setDetailSubmission }
												key={ submission.id } 
											/>
										})}
									</TableContent>
								:
									<LoadingTable numCols={ TABLE_WIDTH } />
								}
							</tbody>

						</table>
					</div>
				</div>

			</Container>

			{ /* Then, render the recent submissions table for this particular chart */ }
			<Container title="Recent Submissions" largeTitle>
				<RecentSubmissionsTable 
					numSubmissions={ NUM_RECENT }
					searchParams={ searchParams }
				/>
			</Container>

		</div>
	:
		<Loading />
};

/* ===== EXPORTS ===== */
export default Levelboard;