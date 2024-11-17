/* ===== IMPORTS ===== */
import { isBefore } from "date-fns";
import { useContext, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { GameContext, MessageContext, UserContext } from "../../utils/Contexts";
import DateHelper from "../../helper/DateHelper";
import FrontendHelper from "../../helper/FrontendHelper";
import RPCRead from "../../database/read/RPCRead";
import UrlHelper from "../../helper/UrlHelper";

const Levelboard = () => {
	/* ===== CONTEXTS ===== */

	// game state, version state, & set disabled version dropdown function from game context
	const { game, version, setDisableVersionDropdown } = useContext(GameContext);

	// add message function from message context
	const { addMessage } = useContext(MessageContext);

	// user state from user context
	const { user } = useContext(UserContext);

	/* ===== VARIABLES ===== */
	const location = useLocation();
	const path = location.pathname.split("/");
	const abb = path[2];
	const category = path[3];
	const type = path[4];
	const levelName = path[5];
	const boardInit = { 
		all: undefined,
		adjacent: undefined,
		filtered: undefined,
		filters: undefined,
		user: undefined
	};
	const navigateTo = useNavigate();

	/* ===== STATES ===== */
	const [board, setBoard] = useState(boardInit);

	/* ===== FUNCTIONS ===== */
	
	// database functions
	const { getChartSubmissions } = RPCRead();
 
	// helper functions
	const { getInclusiveDate } = DateHelper();
	const { capitalize } = FrontendHelper();
	const { addAllExistingSearchParams } = UrlHelper();

	// FUNCTION 1: getPrevAndNext - get the previous and next level names
    // PRECONDTIONS (2 parameters):
    // 1.) category: the current category, also defined in the path
    // 2.) levelName: a string corresponding to the name of a level, also defined in the path
    // POSTCONDITIONS (1 possible outcome, 1 return):
	// the levelLink object is returned, which contains two fields:
    	// a.) prev: the name of the previous level. if it does not exist, value will be null 
    	// b.) next: the name of the next level. if it does not exist, value will be null
    const getPrevAndNext = (category, levelName) => {
        // first, let's get the array of mode objects belonging to category
        const modes = game.mode.filter(mode => mode.category === category);
		let found = false, prev = null;

        // define our obj containing the prev and next variables
        const levelLink = { prev: null, next: null };

        // iterate through each level to find the match, so we can determine previous and next
        for (let i = 0; i < modes.length; i++) {
            const levelArr = modes[i].level;

            for (let j = 0; j < levelArr.length; j++) {
				// extract information from level object
				const level = levelArr[j];
                const name = level.name, chartType = level.chart_type;

				// Special case #1: we found the match. set the found flag to true, and update the prev field in our
				// levelLink object
				if (name === levelName) {
					found = true;
					levelLink.prev = prev;
				}

				// Special case #2: we already found the level, and the current level has the chart type equal to { type } or "both"
				// in this case, update the next field in our levelLink object, and return it
				else if (found && (chartType === type || chartType === "both")) {
					levelLink.next = name;
					return levelLink;
				} 

				// General case: the level has not been found yet, and the current level is not a match. Update the prev variable
				// to the current level if the chart type is equal to { type } or "both".
				else {
					if (chartType === type || chartType === "both") {
						prev = name;
					}
				}
            }
        }
		// if the levelLink object has not been returned by this point, do it
		return levelLink;
    };

	// FUNCTION 2: insertPositionToLevelboard - for each submission, add the position field
    // PRECONDITIONS (1 parameter):
    // 1.) submissions: an array of submission objects, ordered in descending order by record, then in ascending order
    // by submitted_at
    // POSTCONDITIONS (1 possible outcome): 
    // each submission object in the submissions array is updated to include position field, which accurately ranks each record
    // based on the record field
    const insertPositionToLevelboard = submissions => {
        // variables used to determine position of each submission
        let trueCount = 1, posCount = trueCount;

        // now, iterate through each submission, and calculate the position
        submissions.forEach((submission, index) => {
            // update the position field
            submission.position = posCount;
            trueCount++;

            // if the next submission exists, and it's record is different from the current submission, update posCount to trueCount
            if (index < submissions.length-1 && submissions[index+1].record !== submission.record) {
                posCount = trueCount;
            }
        });
    };

	// FUNCTION 3: getFiltered - given a filter object (and optionally, an array of submission objects), get an array of filtered
	// submissions
	// PRECONDITIONS (2 parameters):
	// 1.) filters: a filter object with the following fields: 
	// endDate (Date), live (array), monkeys (array), platforms (array), obsolete (boolean), regions (array), tas: (array)
	// 2.) allSubmissions: an optional parameter, that stores an array of submission objects. this should always be the value of `board.all`,
	// but sometimes, this function is called before the `board` state updates for the first time.
	// POSTCONDITIONS (1 possible outcomes):
	// given the filters object, apply our filters to the array of all submissions, and return the new array of submissions
	const getFiltered = (filters, allSubmissions) => {
		// perform filter
		const submissions = allSubmissions ? allSubmissions : board.all;
		const filtered = submissions.filter(submission => {
			return (			
				// first, filter by submission date
				isBefore(new Date(submission.submitted_at), getInclusiveDate(filters.endDate)) &&

				// next, filter by the `tas` bollean
				filters.tas.includes(submission.tas) &&

				// next, handle the "live" filter
				filters.live.includes(submission.live) &&
				
				// next, handle the "obsolete" filter
				(!filters.obsolete ? !submission.obsolete : true) &&

				// next, handle the "monkeys" filter
				filters.monkeys.includes(submission.monkey.id) &&

				// next, handle the "platforms" filter
				filters.platforms.includes(submission.platform.id) &&

				// finally, handle the "regions" filter
				filters.regions.includes(submission.region.id)
			);
		});

		// next, insert the position field to this set of submissions
		insertPositionToLevelboard(filtered);

		// finally, return filtered submissions
		return filtered;
	};

	// FUNCTION 4: setupBoard - given information about the path, set up the board object
	// PRECONDITIONS (1 parameter):
	// 1.) filters - an optional parameter representing a filter object with the following fields: 
	// endDate (Date), live (array), monkeys (array), platforms (array), obsolete (boolean), regions (array), tas: (array)
	// if this parameter is undefined, we will simply use `board.filters`
	// POSTCONDITIONS (2 possible outcome):
	// if the submissions successfully are retrieved, the list of submissions are generated, and all fields of `applyFilters` are
	// updated
	// if the submissions fail to be retrieved, an error message is rendered to the user, and the board state is NOT updated, leaving the
	// Levelboard component stuck loading
	const setupBoard = async filters => {
		// first, define variables & reset board state
		filters = filters ? filters : board.filters;
		const adjacent = getPrevAndNext(category, levelName);
		setBoard(boardInit);

		try {
			// get chart submissions, & perform filters
			const all = await getChartSubmissions(abb, category, levelName, type, version?.id);
			const filtered = getFiltered(filters, all);
			const userSubmissions = user.profile ?
				all
				.filter(submission => submission.profile.id === user.profile.id)
				.sort((a, b) => new Date(b.submitted_at) - new Date(a.submitted_at))
			:
				[];

			// finally, we can update state the board state hook
			setBoard({ adjacent, all, filters, filtered, user: userSubmissions });

		} catch (error) {
			addMessage("Failed to fetch / update chart data. If refreshing the page does not work, the system may be experiencing an outage.", "error", 10000);
		} finally {
			setDisableVersionDropdown(false);
		}
	};

	// FUNCTION 5: getChartTypes - function that generates array of valid chart types, given information about the level
	// PRECONDITIONS (1 parameter):
	// 1.) level: a level object, which references the current level
	// POSTCONDITIONS (1 possible outcome):
	// depending on the value of the `chart_type` attribute of level, an array of chart type objects is returned
	const getChartTypes = level => {
		if (level.chart_type === "both") {
			return [{ data: "score", renderedData: "Score" }, { data: "time", renderedData: "Time"}];
		} else {
			return [{ data: level.chart_type, renderedData: capitalize(level.chart_type) }];
		}
	};

	// FUNCTION 6: handleTabClick - function that switches leaderboards based on the otherType parameter
	// PRECONDITIONS (1 parameter):
	// 1.) otherType: a string, either "score" or "time"
	// POSTCONDITIONS (2 possible outcome):
	// if otherType and type are the same, this function does nothing
	// otherwise, the user is navigated to the current level's other board
	const handleTabClick = otherType => {
		if (otherType !== type) {
			navigateTo(addAllExistingSearchParams(
				`/games/${ abb }/${ category }/${ otherType }/${ levelName }`
			));
		}
	};

	// FUNCTION 7: handleReplayCheck - function that executes when the user selects the "live-only" checkbox
	// PRECONDITIONS: NONE
	// POSTCONDITIONS (2 possible outcome):
	// if the checkbox goes from OFF -> ON, then we set board.filters.live to [true]
	// otherwise, set board.filters.live to [true, false]
	const handleReplayCheck = e => {
		const live = e.target.checked ? [true] : [true, false];
		setupBoard({ ...board.filters, live });
	};

	// FUNCTION 8: getChartSearchParams - using url path information, generate the equivalent URLSearchParams object
	// PRECONDITIONS: NONE
	// POSTCONDITIONS (1 possible outcome):
	// a URLSearchParams is defined with filters defined by the path, and returned
	const getChartSearchParams = () => {
		const searchParams = new URLSearchParams();
		searchParams.append("game_id", version ? `${ abb }_${ version.id }` : abb);
		searchParams.append("category", category);
		searchParams.append("score", type === "score");
		searchParams.append("level_id", levelName);
		return searchParams;
	};

	return {
		board,
		setupBoard,
		getChartTypes,
		handleTabClick,
		handleReplayCheck,
		getChartSearchParams
	};
};  

/* ===== EXPORTS ===== */
export default Levelboard;