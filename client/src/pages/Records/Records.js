/* ===== IMPORTS ===== */
import { useState } from "react";
import SubmissionRead from "../../database/read/SubmissionRead";

const Records = () => {
    /* ===== STATES ===== */
    const [recordTable, setRecordTable] = useState(undefined);

    /* ===== FUNCTIONS ===== */

    // helper functions
    const { getSubmissions } = SubmissionRead();

    // FUNCTION 1: generateRecord - given a levelName and the array of submission, generate a record object
    // PRECONDITIONS (3 parameters):
    // 1.) params: an object with just 1 integer field: submissionIndex. this is a way to pass a primitive type by reference in JS
    // 2.) levelName: the string name of a level
    // 3.) submissions: submissions: an array containing unfiltered submissions for a particular game. the submissions must be
    // ordered by type in descending order, then by level id in ascending order
    // POSTCONDITIONS (1 possible outcome, 1 return):
    // 1.) a record object is generated, which has 3 fields: level, record, and names
        // level - the string name of a level
        // record - a floating point value that represents the world record, or undefined if there is no record
        // names - an array of user objects (users that have the record), which is a simple object with a username and id field 
    const generateRecord = (params, levelName, submissions) => {
        // initialize variables used in the function
        const start = params.submissionIndex, names = [];
        let record = undefined;

        // loop through all submissions for the current level
        while (params.submissionIndex < submissions.length && submissions[params.submissionIndex].level.name === levelName) {

            // if the current submission has the same record as the first submission for the level, it is record. thus, we need
            // to update our function variables
            if (submissions[params.submissionIndex].details.record === submissions[start].details.record) {
                const user = submissions[params.submissionIndex].user;
                record = submissions[params.submissionIndex].details.record;
                names.push({ username: user.username, id: user.id });
            }
            params.submissionIndex++;
        }

        // return a record object
        return {
            level: levelName,
            record: record,
            names: names
        };
    };

    // FUNCTION 2: generateRecordTable - given a game, category, type, and submissions, generate the record table
    // PRECONDITIONS (4 parameters):
    // 1.) game: an object containing information about the game defined in the path
    // 2.) category: the current category, either "main" or "misc". category is fetched from the URL
    // 3.) type: the current type, either "time" or "score". type is fetched from the URL
    // 4.) submissions: an array containing unfiltered submissions for a particular game. the submissions must be
    // ordered by type in descending order, then by level id in ascending order
    // POSTCONDITIONS (1 possible outcome, 1 return):
    // 1.) recordTable: recordTable has a field for each mode belonging to { game }, { category }, and { type }
    // each field is mapped to an array of record objects, each of which has 3 fields: level, record, and names
    // once this object is generated, call the setRecordTable() function to update the recordTable state
    const generateRecordTable = (game, category, type, submissions) => {
        // initialize variables used in the function
        const recordTable = {};
        const params = { submissionIndex: 0 };
        const isMisc = category === "misc" ? true : false;

        // generate the record table
        game.mode.forEach(mode => {                             // for each mode

            // only consider modes belonging to { category }
            if (mode.misc === isMisc) {
                const records = [];
                mode.level.forEach(level => {                   // for each level

                    // only consider levels with a { type } chart
                    if ([type, "both"].includes(level.chart_type)) {
                        records.push(generateRecord(params, level.name, submissions));
                    }
                });

                // for the current mode, create a new field in the record table with all the records
                recordTable[mode.name] = records;
            }
        });

        return recordTable;
    };

    // FUNCTION 3: fetchRecords - given a game, category, type, fetch submissions and create the record table
    // PRECONDITIONS (4 parameters):
    // 1.) game: an object containing information about the game defined in the path
    // 2.) category: the current category, either "main" or "misc". category is fetched from the URL
    // 3.) type: the current type, either "time" or "score". type is fetched from the URL
    // 4.) submissionReducer: an object with two fields:
        // a.) reducer: the submission reducer itself (state)
        // b.) dispatchSubmissions: the reducer function used to update the reducer
    // POSTCONDITIONS (1 possible outcome):
    // 1.) a recordTable object is generated. recordTable has a field for each mode belonging to { game }, { category }, and { type }
    // each field is mapped to an array of record objects, each of which has 3 fields: level, record, and names
    // once this object is generated, call the setRecordTable() function to update the recordTable state
    const fetchRecords = async (game, category, type, submissionReducer) => {
        // get submissions, and filter based on the details.live field
        const allSubmissions = await getSubmissions(game.abb, category, type, submissionReducer);
        const submissions = allSubmissions.filter(row => row.details.live);

        // generate record table, and update react states
        const recordTable = generateRecordTable(game, category, type, submissions);
        setRecordTable(recordTable);
        console.log(recordTable);
    };

    return { 
        recordTable, 
        fetchRecords
    };
};

/* ===== EXPORTS ===== */
export default Records;