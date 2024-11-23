/* ===== IMPORTS ===== */
import { AppDataContext, GameContext, MessageContext, UserContext } from "../../utils/Contexts";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import styles from "./Levelboard.module.css";
import AddCircleOutlineRoundedIcon from "@mui/icons-material/AddCircleOutlineRounded";
import BananaIcon from "../../assets/svg/Icons/BananaIcon.jsx";
import CachedPageControls from "../../components/CachedPageControls/CachedPageControls.jsx";
import Checkbox from "@mui/material/Checkbox";
import Container from "../../components/Container/Container.jsx";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import FancyLevel from "../../components/FancyLevel/FancyLevel.jsx";
import Filters from "./Filters/Filters.jsx";
import FormControlLabel from "@mui/material/FormControlLabel";
import FrontendHelper from "../../helper/FrontendHelper";
import GameHelper from "../../helper/GameHelper";
import IconButton from "../../components/IconButton/IconButton.jsx";
import Insert from "./Insert/Insert.jsx";
import LevelboardLogic from "./Levelboard.js";
import LevelboardRow from "./LevelboardRow";
import LoadingTable from "../../components/LoadingTable/LoadingTable.jsx";
import Loading from "../../components/Loading/Loading.jsx";
import Popup from "../../components/Popup/Popup.jsx";
import RecentSubmissionsTable from "../../components/RecentSubmissionsTable/RecentSubmissionsTable.jsx";
import ScrollHelper from "../../helper/ScrollHelper";
import SubmissionDetails from "../../components/SubmissionDetails/SubmissionDetails.jsx";
import TableContent from "../../components/TableContent/TableContent.jsx";
import TableTabs from "../../components/TableTabs/TableTabs";
import TuneRoundedIcon from "@mui/icons-material/TuneRounded";
import Update from "./Update/Update.jsx";
import UrlHelper from "../../helper/UrlHelper.js";

function Levelboard({ imageReducer }) {
	/* ===== CONTEXTS ===== */

	// appData state from app data context
	const { appData } = useContext(AppDataContext);

	// game state, version state, & set disable version dropdown function from game context
  const { game, version, setDisableVersionDropdown } = useContext(GameContext);

	// add message function from message context
	const { addMessage } = useContext(MessageContext);

	// user state & is moderator function from user context
  const { user, isModerator } = useContext(UserContext);

	/* ===== HELPER FUNCTIONS ===== */
	const { capitalize, dateB2F } = FrontendHelper();
	const { fetchLevelFromGame } = GameHelper();
	const { scrollToTop } = ScrollHelper();
	const { addAllExistingSearchParams } = UrlHelper();

	/* ===== REFS ===== */
	const prevPathname = useRef(undefined);
	const prevUserId = useRef(undefined);

	/* ===== VARIABLES ===== */
	const navigateTo = useNavigate();
	const location = useLocation();
	const path = location.pathname.split("/");
	const abb = path[2];
	const category = path[3];
	const type = path[4];
	const levelName = path[5];
	const isPracticeMode = appData.categories[category] ? appData.categories[category].practice : undefined;
	const defaultFilters = {
		endDate: dateB2F(),
		live: game.live_preference ? [true] : [false, true],
		monkeys: game.monkey.map(monkey => monkey.id),
		platforms: game.platform.map(platform => platform.id),
		obsolete: false,
		regions: game.region.map(region => region.id),
		tas: [false]
	};
	const defaultPopups = {
		filters: false,
		insert: false,
		update: false,
		details: false
	};
	const buttonWidth = "60px";
	const TABLE_WIDTH = isPracticeMode ? 11 : 10;
	const NUM_RECENT = 10;
	const SUBMISSIONS_PER_TABLE = 50;

	/* ===== STATES & FUNCTIONS ===== */
	const [level, setLevel] = useState(undefined);
	const [pageNum, setPageNum] = useState(1);
	const [popups, setPopups] = useState(defaultPopups);
	const [submitting, setSubmitting] = useState(false);

	// states and functions from js file
	const { 
		board,
		setupBoard,
		getChartTypes,
		handleTabClick,
		handleReplayCheck,
		getChartSearchParams
	} = LevelboardLogic();

	// simple functions for closing any popup
	const closePopup = () => setPopups(defaultPopups);

	// simple function that is called when user clicks a levelboard row (updates the details state with selected submission)
	const handleRowClick = submission => setPopups({ ...popups, details: submission });

	/* ===== MEMOS ===== */
	const searchParams = useMemo(() => {
		return getChartSearchParams();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [abb, category, type, levelName, version]);

	/* ===== EFFECTS ===== */

	// code that is executed when the component mounts
	useEffect(() => {
		scrollToTop();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// code that is executed when the component mounts, and when the `user` state changes
	useEffect(() => {
		if (user.id !== undefined && prevUserId.current === undefined) {
			// see if levelName corresponds to a level stored in the game object
			const level = fetchLevelFromGame(game, levelName, category, type);
			
			// if not, we will print an error message, and navigate to the game screen
			if (!level) {
				addMessage("Chart does not exist.", "error", 5000);
				navigateTo(addAllExistingSearchParams(`/games/${ abb }/${ category }`));
				return;
			}

			// update states
			setLevel(level);
			setupBoard(defaultFilters);
			prevUserId.current = user.id;
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [user]);

	// code that is executed when the component mounts, or when the `location.pathname` state changes
	useEffect(() => {
		if (prevPathname.current && location.pathname !== prevPathname.current) {
			setLevel(fetchLevelFromGame(game, levelName, category, type));
			setupBoard(defaultFilters);
		}
		prevPathname.current = location.pathname;
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [location.pathname]);

	// code that is executed when the component mounts, or when the `version` state changes
	useEffect(() => {
		if (board.filtered) {
			setDisableVersionDropdown(true);
			setupBoard();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [version]);

	/* ===== LEVELBOARD COMPONENT ===== */
	return level ?
		<div className={ styles.levelboard }>

			{ /* Popups */ }
			<Popup 
				renderPopup={ popups.insert } 
				setRenderPopup={ closePopup } 
				width={ `${ isModerator(abb) ? "1000px" : "500px" }` } 
				disableClose={ submitting }
			>
				<Insert 
					level={ level } 
					updateBoard={ setupBoard } 
					submitting={ submitting } 
					setSubmitting={ setSubmitting }
					board={ board } 
				/>
			</Popup>
			<Popup renderPopup={ popups.update } setRenderPopup={ closePopup } width="800px" disableClose={ submitting } >
				<Update level={ level } updateBoard={ setupBoard } submitting={ submitting } setSubmitting={ setSubmitting } />
			</Popup>
			<Popup renderPopup={ popups.filters } setRenderPopup={ closePopup } width="1100px" >
				<Filters currentFilters={ board.filters } defaultFilters={ defaultFilters } updateBoard={ setupBoard } />
			</Popup>
			<Popup renderPopup={ popups.details } setRenderPopup={ closePopup } width="760px" >
				<SubmissionDetails level={ level } updateBoards={ setupBoard } />
			</Popup>

			<Container>

				{ /* Levelboard title - name of levelboard, as well as previous and next buttons */ }
				<div className={ `center ${ styles.title}` }>

					{ /* Previous level button */ }
					{ board.adjacent && board.adjacent.prev ?
							<Link to={ addAllExistingSearchParams(`/games/${ abb }/${ category }/${ type }/${ board.adjacent.prev }`) }>
								<button type="button">←Prev</button>
							</Link>
						:
							<div style={ { width: buttonWidth } }></div>
					}

					{ /* Level name */ }
					<div className={ `center ${ styles.middleTitle }` }>
						<h1><FancyLevel level={ level.name } /></h1>
					</div>

					{ /* Next level button */ }
					{ board.adjacent && board.adjacent.next ?
							<Link to={ addAllExistingSearchParams(`/games/${ abb }/${ category }/${ type }/${ board.adjacent.next }`) }>
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

								<FormControlLabel 
									control={ 
										<Checkbox 
											checked={ !board.filters.live.includes(false) } 
											id="replays" 
											onChange={ e => handleReplayCheck(e) } 
											inputProps={{ "aria-label": "controlled" }} 
											style={{ paddingLeft: "5px", paddingRight: "0" }}
										/>
									}
									label="Live-only"
									labelPlacement="start"
									style={{ margin: "0" }}
								/>

								<IconButton name="Filters" onClick={ () => setPopups({ ...popups, filters: true }) }>
									<TuneRoundedIcon />
								</IconButton>

								{ user.profile && board.user.length > 0 &&
									<IconButton name="Update Submission(s)" onClick={ () => setPopups( { ...popups, update: board.user }) }>
										<EditRoundedIcon />
									</IconButton>
								}

								{ user.profile && 
									<IconButton name={ `Submit ${ capitalize(type) }` } onClick={ () => setPopups({ ...popups, insert: true }) }>
										<AddCircleOutlineRoundedIcon />
									</IconButton>
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

									{ /* If chart is practice mode, then render a column for medals */ }
									{ isPracticeMode && <th id={ styles.medalsIcon }><BananaIcon title="Medals" /></th> }

									<th title="Position">#</th>
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
										{ board.filtered.slice((pageNum-1)*SUBMISSIONS_PER_TABLE, pageNum*SUBMISSIONS_PER_TABLE).map(submission => {
											return <LevelboardRow 
												submission={ submission } 
												imageReducer={ imageReducer }
												level={ level }
												worldRecord={ board.filtered[0].record }
												isPracticeMode={ isPracticeMode }
												onClickFunc={ handleRowClick }
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

					{ /* Render pagination controls at the bottom of this container */ }
					{ board.filters && board.filtered &&
						<CachedPageControls 
							items={ board.filtered }
							itemsPerPage={ SUBMISSIONS_PER_TABLE }
							pageNum={ pageNum }
							setPageNum={ setPageNum }
							itemsName="Submissions"
						/>
					}

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