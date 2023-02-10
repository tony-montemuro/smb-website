const UserStatsHelper = () => {
    // FUNCTION 1: validateMedalsPath - determine if path is valid for Medals component
    // PRECONDITINOS (2 parameters):
    // 1.) game: an object containing information about the game defined in the path
    // 2.) user: an object containing information about the user defined in the path
    // POSTCONDITINOS (1 returns):
    // 1.) error: a string that gives information as to why their is an issue with the path
    // if this string returns a null value, it means no errors were detected
    const validateUserStatsPath = (game, user) => {
        // initialize error variable to null
        let error = null;

        // first, ensure game is legitimate
        if (!game) {
            error = "Error: Invalid game.";
        }

        // next, ensure user is legitimate
        if (!user && !error) {
            error = "Error: Invalid user.";
        }

        return error;
    };

    // FUNCTION 2: getRankings - determine user's ranking for each stage
    // PRECONDITINOS (5 parameters):
    // 1.) levels: a filtered array of levels sorted by the id parameter in ascending order
    // 2.) submissions: submissions: an array containing filtered submissions for a particular game. the submissions must be
    // ordered by type in descending order, then by level id in ascending order
    // 3.) type: a string, either "time" or "score"
    // 4.) userId: a unique string id belonging to a particular user
    // POSTCONDITINOS (1 returns):
    // 1.) rankings: a large object that is split at the highest level by mode the rankings object is filled. within each mode,
    // you have an array of rankings objects, each corresponding to a level within the mode
    const getRankings = (levels, submissions, type, userId) => {
        // construct base rankings obj
        const modes = [...new Set(levels.map(level => level.mode))];
        const rankings = {};
        modes.forEach(mode => { rankings[mode] = [] });

        // define an iterator variable
        let i = 0;

        // loop through each level
        levels.forEach(level => {
            // define variables that correspond to the current level ranking
            const currentLevel = level.name, currentMode = level.mode;
            let record = undefined, pos = undefined, date = undefined;
            let trueCount = 1, posCount = trueCount;

            // while their are submissions remaining, and while the current submission has the same level name
            // as level, we iterate through the submissions, looking for submissions belonging to the current user
            while (i < submissions.length && submissions[i].level.name === currentLevel) {
                const submission = submissions[i];
                if (submission.user.id === userId) {
                    record = type === "time" ? submission.details.record.toFixed(2) : submission.details.record;
                    pos = posCount;
                    date = submission.details.submitted_at;
                }
                trueCount++;
                if (i < submissions.length-1 && submissions[i+1].details.record !== submission.details.record) {
                    posCount = trueCount;
                }
                i++;
            }

            // once we have iterated through all submissions belonging to the current level, we need to update our rankings object
            rankings[currentMode].push({
                level: currentLevel,
                record: record ? record : '',
                date: date ? date.slice(0, 10) : '',
                position: pos ? pos : ''
            });
        });

        return rankings;
    };

    return { validateUserStatsPath, getRankings };
};

export default UserStatsHelper;