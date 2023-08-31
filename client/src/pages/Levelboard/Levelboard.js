/* ===== IMPORTS ===== */
import { isBefore } from "date-fns";
import { useContext, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { GameContext, MessageContext, UserContext } from "../../utils/Contexts";
import DateHelper from "../../helper/DateHelper";
import Submission2Read from "../../database/read/Submission2Read";
import SubmissionHelper from "../../helper/SubmissionHelper";

const Levelboard = () => {
	/* ===== CONTEXTS ===== */

	// game state from game context
	const { game } = useContext(GameContext);

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
		records: null
	};
	const navigate = useNavigate();

	/* ===== STATES ===== */
	const [board, setBoard] = useState(boardInit);
	const [userSubmissions, setUserSubmissions] = useState([]);

	/* ===== FUNCTIONS ===== */
	
	// database functions
	const { getInclusiveDate } = DateHelper();
	const { getSubmissions2 } = Submission2Read();
	const { removeObsolete } = SubmissionHelper();

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
    // based on the details.record field
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

	// FUNCTION 3: setupBoard - given information about the path and the submissionCache, set up the board object
	// PRECONDITIONS (2 parameters):
	// 1.) submissionCache: an object with two fields:
		// a.) cache: the cache object that actually stores the submission objects (state)
		// b.) setCache: the function used to update the cache
	// POSTCONDITIONS (2 possible outcome):
	// if the submissions successfully are retrieved, the list of submissions are generated, and both the `all` and `adjacent` fields
	// are updated
	// if the submissions fail to be retrieved, an error message is rendered to the user, and the board state is NOT updated, leaving the
	// Levelboard component stuck loading
	const setupBoard = async submissionCache => {
		// first, set board to default values, and get the names of the previous and next level
		setBoard(boardInit);
		const { prev, next } = getPrevAndNext(category, levelName);

		try {
			// get submissions, and filter based on the levelId
			const allSubmissions = await getSubmissions2(game.abb, category, type, submissionCache);
			const allLevelSubmissions = allSubmissions.filter(submission => {
				return submission.level.name === levelName
			}).map(submission => Object.assign({}, submission));
	
			// finally, update board state hook, as well as the userSubmission state hook
			setBoard({ ...board, all: allLevelSubmissions, adjacent: { prev: prev, next: next } });
			setUserSubmissions(user.profile ? 
				allLevelSubmissions.filter(submission => submission.profile.id === user.profile.id)
			: 
				[]
			);

		} catch (error) {
			// if the submissions fail to be fetched, let's render an error specifying the issue
			addMessage("Failed to fetch submission data. If refreshing the page does not work, the database may be experiencing some issues.", "error");
		}
	};

	// FUNCTION 4: applyFilters - given a filter object, apply filters, and update the board's `filtered` field
	// PRECONDITIONS (1 parameter):
	// 1.) filters: a filter object with the following fields: 
	// endDate (Date), live (array), monkeys (array), platforms (array), obsolete (boolean), regions (array), tas: (array)
	// POSTCONDITIONS (1 possible outcomes):
	// given the filters object, apply our filters to the array of all submissions, and update the `filters` and `filtered` field 
	// by calling the setBoard() function
	const applyFilters = filters => {
		// first, let's just filter the submissions by date
		let filtered = board.all.filter(submission => isBefore(new Date(submission.submitted_at), getInclusiveDate(filters.endDate)));

		// next, let's filter the submissions by the tas boolean field, depending on the value in filters
		let rta = filters.tas.includes(false) ? filtered.filter(submission => !submission.tas) : [];
		let tas = filters.tas.includes(true) ? filtered.filter(submission => submission.tas) : [];

		// now, if filters.obsolete is true, we want to remove all obsolete runs from both array of submissions
		if (!filters.obsolete) {
			rta = removeObsolete(rta);
			tas = removeObsolete(tas);
		}

		// then, we can combine the two arrays
		filtered = rta.concat(tas);

		// now, let's perform the remainder of the filters
		filtered = filtered.filter(submission => {
			return (			
				// first, let's handle the "live" filter
				filters.live.includes(submission.live) &&

				// next, we handle the "monkeys" filter
				filters.monkeys.includes(submission.monkey.id) &&

				// next, we handle the "platforms" filter
				filters.platforms.includes(submission.platform.id) &&

				// finally, we handle the "regions" filter
				filters.regions.includes(submission.region.id)
			);
		});

		// next, let's correctly sort the filtered submissions
		filtered.sort((a, b) => {
			if (a.record !== b.record) {
				return b.record - a.record;
			}
			return a.submitted_at.localeCompare(b.submitted_at);
		});

		// next, insert the position field to this set of submissions
		insertPositionToLevelboard(filtered);

		// finally, update the `filtered` property of the board state by calling `setBoard()`
		setBoard({ ...board, filtered: filtered, filters: filters });
	};

	// FUNCTION 5: handleTabClick - function that switches leaderboards based on the otherType parameter
	// PRECONDITIONS (1 parameter):
	// 1.) otherType: a string, either "score" or "time"
	// POSTCONDITIONS (2 possible outcome):
	// if otherType and type are the same, this function does nothing
	// otherwise, the user is navigated to the current level's other board
	const handleTabClick = otherType => {
		if (otherType !== type) {
			navigate(`/games/${ abb }/${ category }/${ otherType }/${ levelName }`);
		}
	};

	return {
		board,
		userSubmissions,
		setupBoard,
		applyFilters,
		handleTabClick
	};
};  

/* ===== EXPORTS ===== */
export default Levelboard;