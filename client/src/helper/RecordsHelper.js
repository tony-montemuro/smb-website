const RecordsHelper = () => {

    // FUNCTION 1: validateRecordsPath - determine if path is valid for Records component
    // PRECONDITINOS (1 parameter):
    // 1.) game: an object containing information about the game defined in the path
    // POSTCONDITINOS (1 returns):
    // 1.) error: a string that gives information as to why their is an issue with the path
    // if this string returns a null value, it means no errors were detected
    const validateRecordsPath = (game) => {
        // initialize error variable to null
        let error = null;

        // first, ensure game is legitimate
        if (!game) {
            error = "Error: Invalid game.";
        }

        return error;
    };

    // FUNCTION 2: getRecordTable - generate an object that contains the world records for each level
    // PRECONDITIONS (3 parameters):
    // 1.) levels: an array containing filtered levels, ordered in ascending order by the id field
    // 2.) submissions: an array containing filtered submissions. the submissions must be
    // 3.) type: a string, either "score" or "time"
    // ordered by type in descending order, then by level id in ascending order
    // POSTCONDITIONS (1 return):
    // 1.) recordTable: a large object that is split at the highest level by mode. within each mode, you have an array 
    // of record objects, each corresponding to a level within the mode
    const getRecordTable = (levels, submissions, type) => {
        // construct base recordTable obj
        const modes = [...new Set(levels.map(level => level.mode))];
        const recordTable = {};
        modes.forEach(mode => recordTable[mode] = []);

        // now, let's populate the table with records
        let j = 0;
        levels.forEach(level => {
            // declare variables used to determine the record for each level
            const mode = level.mode, start = j, names = [];
            let record = undefined;

            // loop through all submissions for the current level
            while (j < submissions.length && submissions[j].level.name === level.name) {
                if (submissions[j].details.record === submissions[start].details.record) {
                    const user = submissions[j].user;
                    record = submissions[j].details.record;
                    names.push({ username: user.username, id: user.id });
                }
                j++;
            }

            // finally, update our table
            recordTable[mode].push({
                level: level.name, 
                record: record,
                name: names
            });
        });

        return recordTable;
    };

    return { validateRecordsPath, getRecordTable };
};

export default RecordsHelper;