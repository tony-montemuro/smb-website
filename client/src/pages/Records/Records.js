/* ===== IMPORTS ===== */
import { MessageContext } from "../../utils/Contexts";
import { useContext, useState } from "react";
import AllSubmissionRead from "../../database/read/AllSubmissionRead";
import GameHelper from "../../helper/GameHelper";

const Records = () => {
    /* ===== CONTEXTS ===== */

    // add message function from message context
    const { addMessage } = useContext(MessageContext);

    /* ===== STATES ===== */
    const [recordTable, setRecordTable] = useState(undefined);

    /* ===== FUNCTIONS ===== */

    // helper functions
    const { getRelevantModes } = GameHelper();

    // database functions
    const { getSubmissions2 } = AllSubmissionRead();

    // FUNCTION 1: generateRecord - given a levelName and the array of submission, generate a record object
    // PRECONDITIONS (3 parameters):
    // 1.) submissionIndex: the current index in our higher-level loop of the submissions
    // 2.) level: the level object associated with the next set of submissions
    // 3.) submissions: an array containing unfiltered submissions for a particular game. the submissions must
    // be ordered by level id ascending order, then by record in descending order
    // POSTCONDITIONS (1 possible outcome, 2 returns):
    // 1.) record: a record object is generated, which has 3 fields: level, record, and profiles
        // level - the string name of a level
        // record - a floating point value that represents the world record, or null if there is no record
        // profiles - an array of profile objects (users that have the record), which is a simple object with a username and id field 
    // 2.) index: the updated submissionIndex is returned, since JS passes integers by value, and this value is changed in this function
    const generateRecord = (submissionIndex, level, submissions) => {
        // initialize variables used in the function
        const start = submissionIndex;
        const record = {
            level: level,
            profiles: [],
            record: null
        };

        // loop through all submissions for the current level
        while (submissionIndex < submissions.length && submissions[submissionIndex].level.name === level.name) {

            // if the current submission has the same record as the first submission for the level, it is record. thus, we need
            // to update the record object
            if (submissions[submissionIndex].record === submissions[start].record) {
                const profile = submissions[submissionIndex].profile;
                record.record = submissions[submissionIndex].record;
                record.profiles.push(profile);
            }
            submissionIndex++;
        }

        // return the record object, as well as submissionIndex
        return { record: record, index: submissionIndex }; 
    };

    // FUNCTION 2: generateRecordTable - given a game, type, and submissions array, generate the record table
    // PRECONDITIONS (3 parameters):
    // 1.) modes: an array of mode objects, which come from the game object
    // 2.) type: the current type, either "time" or "score". type is fetched from the URL
    // 3.) submissions: an array containing submissions for a particular game. the submissions must
    // be ordered by level id ascending order, then by record in descending order
    // POSTCONDITIONS (1 possible outcome, 1 return):
    // 1.) recordTable: recordTable has a field for each mode belonging to { game }, { category }, and { type }
    // each field is mapped to an array of record objects, each of which has 3 fields: level, record, and profiles
    // once this object is generated, call the setRecordTable() function to update the recordTable state
    const generateRecordTable = (modes, type, submissions) => {
        // initialize variables used in the function
        const recordTable = {};
        let submissionIndex = 0;

        // generate the record table
        modes.forEach(mode => {                 // for each mode
            const records = [];
            mode.level.forEach(level => {       // for each level

                // only consider levels with a { type } chart
                if ([type, "both"].includes(level.chart_type)) {
                    const { index, record } = generateRecord(submissionIndex, level, submissions);
                    submissionIndex = index;
                    records.push(record);
                }
            });

            // for the current mode, create a new field in the record table with all the records
            recordTable[mode.name] = records;
        });

        return recordTable;
    };

    // FUNCTION 3: fetchRecords - given a game, category, type, fetch submissions and create the record table
    // PRECONDITIONS (4 parameters):
    // 1.) game: an object containing information about the game defined in the path
    // 2.) category: the current category. category is fetched from the URL
    // 3.) type: the current type, either "time" or "score". type is fetched from the URL
    // 4.) submissionReducer: an object with two fields:
        // a.) reducer: the submission reducer itself (state)
        // b.) dispatchSubmissions: the reducer function used to update the reducer
    // POSTCONDITIONS (1 possible outcome):
    // if the submission query is a success, a recordTable object is generated. records has two fields: all and live. each field maps
    // to a recordTable object. each recordTable object has a field for each mode belonging to { game }, { category }, and { type }
    // each field is mapped to an array of record objects, each of which has 3 fields: level, record, and profiles. once this object is
    // generated, call the setRecordTable() function to update the recordTable state
    // if the submissions fail to be retrieved, an error message is rendered to the user, and the record table state is NOT updated, 
    // leaving the Records component stuck loading
    const fetchRecords = async (game, category, type, submissionCache) => {
        // first, reset record table state to default value (undefined)
        setRecordTable(undefined);

        try {
            // get submissions, and generate two filtered arrays: allSubmissions, and liveSubmissions
            const submissions = await getSubmissions2(game.abb, category, type, submissionCache);
            const allSubmissions = submissions.filter(submission => submission.submission.length > 0);
            const liveSubmissions = allSubmissions.filter(submission => submission.live);

            // next, get the relevant list of modes
            const modes = getRelevantModes(game, category, type);

            // generate two record tables: 1 for all submissions, and 1 for live submissions
            const allRecordTable = generateRecordTable(modes, type, allSubmissions);
            const liveRecordTable = generateRecordTable(modes, type, liveSubmissions);

            // create a records object that stores both tables, and update recordTable
            const records = {
                all: allRecordTable,
                live: liveRecordTable
            };
            setRecordTable(records);

        } catch (error) {
            // if the submissions fail to be fetched, let's render an error specifying the issue
			addMessage("Failed to fetch submission data. If refreshing the page does not work, the database may be experiencing some issues.", "error");
        }
    };

    // FUNCTION 4: allGreater - given a mode and index, determine if the "all" record is better than the live record
    // PRECONDITIONS (3 parameters):
    // 1.) records: an object that stores the record tables for both all records and live records
    // 2.) mode: a string representing one of the game modes
    // 3.) index: an integer representing the index of one of the levels within a mode
    // POSTCONDITIONS (1 return, 1 possible outcome):
    // 1.) the allRecord and liveRecord are fetched from the records object. if the allRecord is greater than liveRecord, true is returned.
    // otherwise, false is returned
    const allGreater = (records, mode, index) => {
        // determine both the live and record based on the mode and index parameters
        const allRecord = records.all[mode][index].record;
        const liveRecord = records.live[mode][index].record;
        return allRecord > liveRecord;
    };

    // FUNCTION 5: numNotLive - determine how many non-live records exist for a particular game
    // PRECONDITIONS (1 condition):
    // recordTable has been defined
    // POSTCONDITIONS (1 return, 1 possible outcome):
    // 1.) num: an integer count of every record where the all record is greater than the live record is returned
    const numNotLive = () => {
        // initialize a num variable
        let num = 0;

        // iterate through each mode in the record table
        Object.keys(recordTable.all).forEach(mode => {

            // iterate through each level, and count up all the records where all is greater than live
            for (let i = 0; i < recordTable.all[mode].length; i++) {
                num += allGreater(recordTable, mode, i);
            }

        });
        
        return num;
    };

    return { 
        recordTable, 
        fetchRecords,
        allGreater,
        numNotLive
    };
};

/* ===== EXPORTS ===== */
export default Records;