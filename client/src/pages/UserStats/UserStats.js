/* ===== IMPORTS ===== */
import { MessageContext } from "../../Contexts";
import { useContext, useState } from "react";
import MedalsHelper from "../../helper/MedalsHelper";
import TotalizerHelper from "../../helper/TotalizerHelper";
import SubmissionRead from "../../database/read/SubmissionRead";

const UserStats = () => {
    /* ===== CONTEXTS ===== */

    // add message function from message context
    const { addMessage } = useContext(MessageContext);

    /* ===== STATES ===== */
    const [stats, setStats] = useState(undefined);

    /* ===== FUNCTIONS ===== */

    // helper functions
    const { getUserMap, getMedalTable, insertPositionToMedals } = MedalsHelper();
    const { calculateTotalTime, getTotalMaps, sortTotals, insertPositionToTotals } = TotalizerHelper();
    const { getSubmissions } = SubmissionRead();

    // FUNCTION 1 - generateRecord - given a submissionIndex, profileId, levelName, and submission list, generate a record
    // object that contains information about a user's submission on a certain level
    // PRECONDITIONS (4 parameters):
    // 1.) submissionIndex: the current index in our higher-level loop of the submissions
    // 2.) profileId: a string that contains the id of a user
    // 3.) levelName: the string name of a level
    // 4.) submissions: submissions: an array containing submissions for a particular game. the submissions must be
    // ordered by type in descending order, then by level id in ascending order
    // POSTCONDITIONS (1 possible outcome, 2 returns):
    // 1.) record: a record object is generated, which has 4 fields: level, record, date, and position
        // level - the string name of a level
        // record - a floating point value that represents the world record, or null if user has no record
        // date - a string representing the submission date of the user's record
        // position - the position of the submission
    // 2.) index: the updated submissionIndex is returned, since JS passes integers by value, and this value is changed in this function
    const generateRecord = (submissionIndex, profileId, levelName, submissions) => {
        // initialize variables used in the function
        let trueCount = 1, posCount = trueCount;
        const record = {
            level: levelName,
            record: null,
            date: null,
            position: null
        };

        // while their are submissions remaining, and while the current submission has the same level name
        // as levelName, we iterate through the submissions, looking for submissions belonging to the current user
        while (submissionIndex < submissions.length && submissions[submissionIndex].level.name === levelName) {
            const submission = submissions[submissionIndex];

            // if the current submission belongs to profileId, update record object
            if (submission.profile.id === profileId) {
                record.record = submission.details.record;
                record.position = posCount;
                record.date = submission.details.submitted_at;
            }
            trueCount++;

            // if there is another submission left, and the next submission has a worse record than the current record, we
            // need to update posCount
            if (submissionIndex < submissions.length-1 && submissions[submissionIndex+1].details.record !== submission.details.record) {
                posCount = trueCount;
            }
            submissionIndex++;
        }

        // return the record object, as well as submissionIndex
        return { record: record, index: submissionIndex }; 
    };

    // FUNCTION 2: generate rankings - given a path, game object, and submissions array, generate a rankings object
    // PRECONDITIONS (4 parameters):
    // 1.) path: an array that contains path information from the URL
    // 2.) game: an object containing information about the game defined in the path
    // 3.) submissions: an array containing submissions for a particular game. the submissions must
    // be ordered by type in descending order, then by level id in ascending order
    // POSTCONDITIONS (1 possible outcome, 1 return):
    // 1.) rankings: rankings has a field for each mode belonging to { profileId }, { category }, and { type }
    // each field is mapped to an array of record objects, each of which has 4 fields: level, record, date, and position
    const generateRankings = (path, game, submissions) => {
        // initialize variables used in the function
        const profileId = parseInt(path[2]), category = path[4], type = path[5];
        const rankings = {};
        const isMisc = category === "misc" ? true : false;
        let submissionIndex = 0;

        // generate the rankings table
        game.mode.forEach(mode => {

            // only consider modes belonging to { category }
            if (mode.misc === isMisc) {
                const records = [];
                mode.level.forEach(level => {

                    // only consider levels with a { type } chart
                    if ([type, "both"].includes(level.chart_type)) {
                        const { index, record } = generateRecord(submissionIndex, profileId, level.name, submissions);
                        submissionIndex = index;
                        records.push(record);
                    }
                });

                // for the current mode, create a new field in the rankings table with all the records
                rankings[mode.name] = records;
            }
        });

        return rankings;
    };

    // FUNCTION 3: fetch user stats - given a path, game object, and submissionReducer object, fetch the stats object
    // PRECONDITIONS (3 parameters):
    // 1.) path: an array that contains path information from the URL
    // 2.) game: an object containing information about the game defined in the page
    // 3.) submissionReducer: an object with two fields:
        // a.) reducer: the submission reducer itself (state)
        // b.) dispatchSubmissions: the reducer function used to update the reducer
    // POSTCONDITIONS (1 possible outcome):
    // if the submission query is successful, we are able to first generate two submission arrays: one for all, and one for live only. 
    // from these arrays, we generate two separate userStats objects. these two objects are then combined to form 'stats',
    // a single object which contains both user stats objects. the setStats() function is called to update the stats object
    // if the submissions fail to be retrieved, an error message is rendered to the user, and the stats state is NOT updated, 
    // leaving the UserStats component stuck loading
    const fetchUserStats = async (path, game, submissionReducer) => {
        // first, reset stats state to default value (undefined), and unpack path parameter
        setStats(undefined);
        const profileId = parseInt(path[2]), category = path[4], type = path[5];

        // next, let's compute the total time of the game
        const isMisc = category === "misc" ? true : false;
        const totalTime = calculateTotalTime(game, isMisc);

        try {
            // fetch submissions
            const allSubmissions = await getSubmissions(game.abb, category, type, submissionReducer);

            // let's start with the totalizer
            const { allTotalsMap, liveTotalsMap } = getTotalMaps(allSubmissions, type, totalTime);
            const { allTotals, liveTotals } = sortTotals(allTotalsMap, liveTotalsMap, type);
            insertPositionToTotals(allTotals, type);
            insertPositionToTotals(liveTotals, type);

            // we can filter the allTotals & liveTotals array looking for the profileId's object
            const allTotal = allTotals.find(obj => obj.profile.id === profileId);
            const liveTotal = liveTotals.find(obj => obj.profile.id === profileId);

            // now, it's time to do the medal table
            const submissions = allSubmissions.filter(row => row.details.live);
            const userMap = getUserMap(submissions);
            const medalTable = getMedalTable(userMap, submissions);
            insertPositionToMedals(medalTable);

            // we can filter the medalTable looking for the profileId's object. [note: medal tables are the same for all and live!]
            const allMedals = medalTable.find(obj => obj.profile.id === profileId);
            const liveMedals = allMedals;

            // now, it's time to do player rankings
            const allRankings = generateRankings(path, game, allSubmissions);
            const liveRankings = generateRankings(path, game, submissions);

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