import FrontendHelper from "./FrontendHelper";

const LevelboardHelper = () => {
    // helper functions from separate modules
    const { recordB2F } = FrontendHelper();

    // FUNCTION -1: validateLevelboardPath - determine if path is valid for Levelboard component
    // PRECONDITINOS (2 parameters):
    // 1.) game: an object containing information about the game defined in the path
    // 2.) level: an object containing information about the level defined in the path
    // POSTCONDITINOS (1 returns):
    // 1.) error: a string that gives information as to why their is an issue with the path
    // if this string returns a null value, it means no errors were detected
    const validateLevelboardPath = (game, level) => {
        // initialize error variable to null
        let error = null;

        // first, ensure game is legitimate
        if (!game) {
            error = "Error: Invalid game.";
        }

        // next, ensure level is legitimate
        if (!level && !error) {
            error = "Error: Invalid user.";
        }

        // return error message
        return error;
    };

    // FUNCTION 0: calculateTotalTime - find the total time
    // PRECONDITIONS (3 parameters):
    // 1.) levels is the list of all parameters, which is set upon page load
    // 2.) abb is the game specified by the path
    // 3.) isMisc is a boolean flag, determined by the path
    // 4.) the current type, either "time" or "score"
    // POSTCONDITIONS (1 return):
    // 1.) timeTotal: the sum of all time attributes from the level array, filtered by abb and isMisc
    const calculateTotalTime = (levels, abb, isMisc, type) => {
        // initialize totalTime variable, with a default value of null
        let totalTime = null;

        // if type is time, we will filter levels, and compute the totalTime
        if (type === "time") {
            totalTime = 0;
            const filteredLevels = levels.filter(row => row.game === abb && row.misc === isMisc && ["time", "both"].includes(row.chart_type));
            filteredLevels.forEach(level => totalTime += level.time);
        }
        return totalTime;
    };

    // FUNCTION 1: addPositionToLevelboard
    // Precondition: board is a list of record objects
    // mode is a string, with a value equal to 'time' or 'score'
    // Postcondition: the board object is updated to include position field,
    // which accurately ranks each record based on the {mode} field
    const addPositionToLevelboard = (board, mode) => {
        // variables used to determine position of each submission
        let trueCount = 1;
        let posCount = trueCount;

        // now, iterate through each record, and calculate the position.
        for (let i = 0; i < board.length; i++) {
            const record = board[i];
            record["position"] = posCount;
            trueCount++;
            if (i < board.length-1 && board[i+1][`${mode}`] !== record[`${mode}`]) {
                posCount = trueCount;
            }
        }
    };

    const insertPositionToLevelboard = (submissions) => {
        // variables used to determine position of each submission
        let trueCount = 1, posCount = trueCount;

        // now, iterate through each submission, and calculate the position
        submissions.forEach((submission, index) => {
            // update the position field
            submission.details.position = posCount;
            trueCount++;

            // if the next submission exists, and it's record is different from the current submission, update posCount to trueCount
            if (index < submissions.length-1 && submissions[index+1].details.record !== submission.details.record) {
                posCount = trueCount;
            }
        });
    };

    // FUNCTION 2: containsE
    // Precondition: num is a string that represents a number
    // Postcondition: if the string contains an E, true is returned. else, false.
    const containsE = num => {
        const numStr = String(num);
        console.log(numStr);
        if (numStr.includes('e')) {
            return true;
        }
        return false;
     }

    // FUNCTION 3: decimalCount
    // Precondition: num is a string that represents a number
    // Postcondition: the number of characters present after the decimal point is returned
    const decimalCount = num => {
        const numStr = String(num);
        if (numStr.includes('.')) {
           return numStr.split('.')[1].length;
        };
        
        // if number does not contain a decimal point, return 0
        return 0;
     }

     // FUNCTION 4: dateB2F ("date backend-to-frontend")
     // Precondition: the date parameter can take two possible states: a timestamptz formatted date, or null
     // Postcondition: if null, the function will return the current date. otherwise, the function will return the formatted date, 
     // converted to the client's location. output will have the following format: YYYY-MM-DD
     const dateB2F = date => {
        const d = date ? new Date(date) : new Date();
        const year = d.getFullYear();
        const month = ("0"+(d.getMonth()+1)).slice(-2);
        const day = ("0"+d.getDate()).slice(-2);
        return `${year}-${month}-${day}`;
     };

    // FUNCTION 4.5: submission2Form ("submission to form")
    // PRECONDITIONS (3 parameters):
    // 1.) submission is a submission object, or undefined
    // 2.) game is a game object
    // 3.) userId is a uuid string that belongs to some user, or is null
    // POSTCONDITIONS (1 return):
    // 1.) an object, which takes data from submission (if it exists), game, and userId (if it exists), and
    // transforms it into an object which is compatible with the submission form
     const submission2Form = (submission, game, userId) => {
        // if a submission exists, we can use the data to form our formData object
        if (submission) {
            const details = submission.details;
            return {
                record: recordB2F(details.record, game.type),
                monkey_id: details.monkey.id,
                record_id: details.region.id,
                live: details.live,
                proof: details.proof,
                comment: details.comment ? details.comment : "",
                user_id: userId,
                game_id: game.abb,
                level_id: game.levelName,
                submitted_at: dateB2F(details.submitted_at),
                message: ""
            };

        // if not, we can fill the object with default data values
        } else {
            return {
                record: "",
                monkey_id: game.monkeys[0].id,
                region_id: game.regions[0].id,
                live: true,
                proof: "",
                comment: "",
                user_id: userId,
                game_id: game.abb,
                level_id: game.levelName,
                submitted_at: dateB2F(),
                message: ""
            };
        }
    };

     // FUNCTION 5: dateF2B ("date frontend-to-backend")
     // Precondition: the date parameter can take two possible states: a date with the following format: YYYY-MM-DD, or null.
     // Postcondition: the date is returned with the following format: YYYY-MM-DDTHH:MM:SS.***+00
     const dateF2B = date => {
        return date ? date+"T12:00:00.000+00" : new Date().toISOString().replace("Z", "+00");
     };

    // FUNCTION 6: getPosition - determine the posititon of a new submission
    // PRECONDITIONS (3 parameters):
    // 1.) record is a string representing a floating-point value
    // 2.) submissions is a list of submissions, ordered by position
    // POSTCONDITIONS (1 return):
    // 1.) position: an integer value that describes the position of the new record in the submission list
    const getPosition = (record, submissions) => {
        // perform a while loop to find the first submission whose record is less than or equal to record param
        let i = 0;
        while (i < submissions.length && submissions[i].details.record > record) {
            ++i;
        }

        // if a submission was not found, we want to return one greater than the length of the submissions array
        if (i === submissions.length) {
            return submissions.length+1;
        }

        // otherwise, just return the position of the submission found by the loop
        return submissions[i].details.position;
    };

    return { 
        validateLevelboardPath, 
        calculateTotalTime, 
        addPositionToLevelboard, 
        insertPositionToLevelboard, 
        containsE, 
        decimalCount, 
        dateB2F, 
        submission2Form,
        dateF2B,
        getPosition
    };
};

export default LevelboardHelper;