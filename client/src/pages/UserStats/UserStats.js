/* ===== IMPORTS ===== */
import { MessageContext } from "../../utils/Contexts";
import { useContext, useState } from "react";
import GameHelper from "../../helper/GameHelper";
import MedalsHelper from "../../helper/MedalsHelper";
import SubmissionHelper from "../../helper/SubmissionHelper";
import SubmissionRead from "../../database/read/SubmissionRead";
import TotalizerHelper from "../../helper/TotalizerHelper";

const UserStats = () => {
    /* ===== CONTEXTS ===== */

    // add message function from message context
    const { addMessage } = useContext(MessageContext);

    /* ===== STATES ===== */
    const [stats, setStats] = useState(undefined);

    /* ===== FUNCTIONS ===== */

    // helper functions
    const { getRelevantModes, isPracticeMode } = GameHelper();
    const { getUserMap, getMedalTable, insertPositionToMedals } = MedalsHelper();
    const { getFilteredForRankings } = SubmissionHelper();
    const { calculateTotalTime, getTotalMaps, sortTotals, insertPositionToTotals } = TotalizerHelper();

    // database functions
    const { getSubmissions } = SubmissionRead();

    // FUNCTION 1 - generateRecord - given a submissionIndex, profileId, levelName, and submission list, generate a record
    // object that contains information about a user's submission on a certain level
    // PRECONDITIONS (4 parameters):
    // 1.) submissionIndex: the current index in our higher-level loop of the submissions
    // 2.) profileId: a string that contains the id of a user
    // 3.) level: the level object associated with the following set of submissions
    // 4.) submissions: submissions: an array containing submissions for a particular game. the submissions must be
    // ordered by level id in ascending order, then by record in descending order
    // POSTCONDITIONS (1 possible outcome, 2 returns):
    // 1.) record: a record object is generated, which has 4 fields: level, record, date, and position
        // level - the level object associated with the record
        // record - a floating point value that represents the world record, or null if user has no record
        // date - a string representing the submission date of the user's record
        // position - the position of the submission
    // 2.) index: the updated submissionIndex is returned, since JS passes integers by value, and this value is changed in this function
    const generateRecord = (submissionIndex, profileId, level, submissions) => {
        // initialize variables used in the function
        let trueCount = 1, posCount = trueCount;
        const record = {
            level: level,
            record: null,
            date: null,
            position: null
        };

        // while their are submissions remaining, and while the current submission has the same level name
        // as level.name, we iterate through the submissions, looking for submissions belonging to the current user
        while (submissionIndex < submissions.length && submissions[submissionIndex].level.name === level.name) {
            const submission = submissions[submissionIndex];

            // if the current submission belongs to profileId, update record object
            if (submission.profile.id === profileId) {
                record.record = submission.record;
                record.position = posCount;
                record.date = submission.submitted_at;
            }
            trueCount++;

            // if there is another submission left, and the next submission has a worse record than the current record, we
            // need to update posCount
            if (submissionIndex < submissions.length-1 && submissions[submissionIndex+1].record !== submission.record) {
                posCount = trueCount;
            }
            submissionIndex++;
        }

        // return the record object, as well as submissionIndex
        return { record: record, index: submissionIndex }; 
    };

    // FUNCTION 2: generate rankings - given a path, game object, and submissions array, generate a rankings object
    // PRECONDITIONS (3 parameters):
    // 1.) modes: an array of mode objects containing the relevant modes for the rankings
    // 2.) path: an array that contains path information from the URL
    // 3.) submissions: an array containing submissions for a particular game. the submissions must be
    // ordered by level id in ascending order, then by record in descending order
    // POSTCONDITIONS (1 possible outcome, 1 return):
    // 1.) rankings: rankings has a field for each mode belonging to { profileId }, { category }, and { type }
    // each field is mapped to an array of record objects, each of which has 4 fields: level, record, date, and position
    const generateRankings = (modes, path, submissions) => {
        // initialize variables used in the function
        const profileId = parseInt(path[2]), type = path[5];
        const rankings = {};
        let submissionIndex = 0;

        // generate the rankings table
        modes.forEach(mode => {             // for each mode
            const records = [];
            mode.level.forEach(level => {   // for each level

                // only consider levels with a { type } chart
                if ([type, "both"].includes(level.chart_type)) {
                    const { index, record } = generateRecord(submissionIndex, profileId, level, submissions);
                    submissionIndex = index;
                    records.push(record);
                }
            });

            // for the current mode, create a new field in the rankings table with all the records
            rankings[mode.name] = records;
        });

        return rankings;
    };

    // FUNCTION 3: fetchUserStats - given a path, game object, and submissionCache object, fetch the stats object
    // PRECONDITIONS (3 parameters):
    // 1.) path: an array that contains path information from the URL
    // 2.) game: an object containing information about the game defined in the page
    // 3.) submissionCache: an object with two fields:
		// a.) cache: the cache object that actually stores the submission objects (state)
		// b.) setCache: the function used to update the cache
    // POSTCONDITIONS (1 possible outcome):
    // if the submission query is successful, we are able to first generate two submission arrays: one for all, and one for live only. 
    // from these arrays, we generate two separate userStats objects. these two objects are then combined to form 'stats',
    // a single object which contains both user stats objects. the setStats() function is called to update the stats object
    // if the submissions fail to be retrieved, an error message is rendered to the user, and the stats state is NOT updated, 
    // leaving the UserStats component stuck loading
    const fetchUserStats = async (path, game, submissionCache) => {
        // first, reset stats state to default value (undefined), unpack path parameter, and define our stats
        // collection objects
        setStats(undefined);
        const profileId = parseInt(path[2]), category = path[4], type = path[5];
        let allTotal, liveTotal, allMedals, liveMedals, allRankings, liveRankings;

        // next, let's compute the total time of the game
        const totalTime = calculateTotalTime(game, category);

        try {
            // fetch submissions
            const submissions = await getSubmissions(game.abb, category, type, submissionCache);
            const allSubmissions = getFilteredForRankings(submissions);
            const liveSubmissions = allSubmissions.filter(submission => submission.live);

            // only bother with totalizer and medal table for practice mode categories
            if (isPracticeMode(category)) {

                // let's start with the totalizer
                const { allTotalsMap, liveTotalsMap } = getTotalMaps(allSubmissions, type, totalTime);
                const { allTotals, liveTotals } = sortTotals(allTotalsMap, liveTotalsMap, type);
                insertPositionToTotals(allTotals, type);
                insertPositionToTotals(liveTotals, type);

                // we can filter the allTotals & liveTotals array looking for the profileId's object
                allTotal = allTotals.find(obj => obj.profile.id === profileId);
                liveTotal = liveTotals.find(obj => obj.profile.id === profileId);

                // now, it's time to do the medal table
                const userMap = getUserMap(liveSubmissions);
                const medalTable = getMedalTable(userMap, liveSubmissions);
                insertPositionToMedals(medalTable);

                // we can filter the medalTable looking for the profileId's object. [note: medal tables are the same for all and live!]
                allMedals = medalTable.find(obj => obj.profile.id === profileId);
                liveMedals = allMedals;
            }

            // now, it's time to do player rankings. first, get the relevant list of modes
            const modes = getRelevantModes(game, category, type);

            // finally, generate the rankings
            allRankings = generateRankings(modes, path, allSubmissions);
            liveRankings = generateRankings(modes, path, liveSubmissions);

            // create our stats object
            const stats = {
                all: {
                    medals: allMedals,
                    rankings: allRankings,
                    total: allTotal
                },
                live: {
                    medals: liveMedals,
                    rankings: liveRankings,
                    total: liveTotal
                }
            };
            
            // update the stats state hook
            setStats(stats);

        } catch (error) {
            // if the submissions fail to be fetched, let's render an error specifying the issue
			addMessage("Failed to fetch submission data. If refreshing the page does not work, the database may be experiencing some issues.", "error");
        };
    };

    return { 
        stats,
        fetchUserStats
    };
};

/* ===== EXPORTS ===== */
export default UserStats;