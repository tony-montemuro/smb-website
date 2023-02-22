import FrontendHelper from "./FrontendHelper";

const LevelboardHelper = () => {
    // helper functions from separate modules
    const { capitalize, recordB2F } = FrontendHelper();

    // FUNCTION 1: validateLevelboardPath - determine if path is valid for Levelboard component
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

    // FUNCTION 2: insertPositionToLevelboard
    // PRECONDITIONS (1 parameter):
    // 1.) submissions: an array of submission objects
    // POSTCONDITION (no return): 
    // each submission object in the submissions array  is updated to include position field,
    // which accurately ranks each record based on the record field
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

    // FUNCTION 3: dateB2F ("date backend-to-frontend")
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

    // FUNCTION 4: submission2Form ("submission to form")
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

    // FUNCTION 6: validateRecord
    // PRECONDITIONS (2 parameters):
    // 1.) record: a string value representing the record of the submission
    // 2.) type: a string value, either "score" or "time"
    // POSTCONDITIONS (1 parameter):
    // 1.) error: a string that either contains an error message, or undefined, if there is no error
    const validateRecord = (recordField, type) => {
        // first, validate that record field is non-null
        if (!recordField) {
            return `${ capitalize(type) } is required.`;
        }

        // next, we need to perform two conversions, since it is no guaranteed that 'recordField' is of type
        // float or string
        const record = parseFloat(recordField);
        const recordStr = String(recordField);

        // let's check for invalid characters; specifically, the 'e' character
        if (recordStr.includes('e')) {
            return "Invalid character detected in submission. Please ensure submission has no letters.";
        }

        // validate that record is positive
        if (record <= 0) {
            return `${ capitalize(type) } must be a positive value.`;
        }

        // validate that record is not too large. this is somewhat arbitrary, but will leave it at this value for now*
        if (record > 2147483647) {
            return `${ capitalize(type) } is invalid.`;
        }

        // make sure scores are integers
        if (type === 'score') {
            if (!Number.isInteger(record)) {
                return "Score must be an integer value.";
            }
        }

        // make sure time has two decimal places
        if (type === 'time') {
            let decimalCount = 0;
            if (recordStr.includes('.')) {
                decimalCount = recordStr.split('.')[1].length;
            }
            if (decimalCount !== 2) {
                return "Please ensure your submission has two decimal places.";
            }
        }

        // if we made it this far, the record is valid! return undefined, since there is no error
        return undefined;
    };

    // FUNCTION 7: validateProof
    // PRECONDITIONS (1 parameter):
    // 1.) proof: a string value representing the proof of the submission
    // POSTCONDITIONS (1 parameter):
    // 1.) error: a string that either contains an error message, or undefined, if there is no error
    const validateProof = proof => {
        // check if the proof field is non-null
        if (!proof) {
            return "Proof is required.";
        }

        // if we made it this far, the comment is valid! return undefined, since there is no error
        return undefined;
    };

    // FUNCTION 8: validateComment
    // PRECONDITIONS (1 parameter):
    // 1.) comment: a string value representing the comment of the submission
    // POSTCONDITIONS (1 parameter):
    // 1.) error: a string that either contains an error message, or undefined, if there is no error
    const validateComment = comment => {
        // check if the comment is greater than 100 characters long
        if (comment.length > 100) {
            return "Comment must be 100 characters or less.";
        }

        // if we made it this far, the comment is valid! return undefined, since there is no error
        return undefined;
    };

    // FUNCTION 9: validateMessage
    // PRECONDITIONS (1 parameter):
    // 1.) message: a string value representing the message of the submission
    // POSTCONDITIONS (1 parameter):
    // 1.) error: a string that either contains an error message, or undefined, if there is no error
    const validateMessage = message => {
        // check if the message is greater than 100 characters long
        if (message.length > 100) {
            return "Message must be 100 characters or less.";
        }

        // if we made it this far, the comment is valid! return undefined, since there is no error
        return undefined;
    };

    // FUNCTION 10: fixDateForSubmission
    // PRECONDITIONS (4 parameters):
    // 1.) submittedAt: a string representing a date with a front-end format
    // 2.) oldSubmission: either a submission object belonging to a user, or undefined, depending on whether the current
    // 3.) record: a string or float value representing the record that the user is submitting
    // 4.) type: a string value, either "score" or "time"
    // user has submitted to this chart
    // POSTCONDITIONS (1 parameter):
    // 1.) backendDate: a string representing a date with the back-end format, or, undefined. undefined is returned only if
    // a user is subitting a new record, but they realized they forgot to change the date
    const fixDateForSubmission = (submittedAt, oldSubmission, record, type) => {
        // first, we need to handle defining the date differently if the user has a previous submissions
        if (oldSubmission) {
			const prevDate = dateB2F(oldSubmission.details.submitted_at);

			// special case: user is attempting to submit a new { type }, but has either forgotten to change the date of their old submission,
			// or has deliberately not changed it. give them a confirmation box to ensure they have not made a mistake. if they hit 'no', the submission
			// process will cancel. otherwise, continue.
			if (submittedAt === prevDate && record !== oldSubmission.details.record) {
				if (!window.confirm(`You are attempting to submit a new ${ type } with the same date as the previous submission. Are you sure this is correct?`)) {
					return undefined;
				}
			}

			// CASE 1: the submission date from the form is equal to the submission date in the backend. in this case, just return
            // the details.submitted_at field from the oldSubmission object
			if (submittedAt === prevDate) {
				return oldSubmission.details.submitted_at;
			}
		}

        // CASE 2: the submission date from the form is equal to the current date. in this case, return the default call to the
        // function converting dates from front-end format to back-end format
        const currDate = dateB2F();
        if (submittedAt === currDate) {
            return dateF2B();
        }

        // CASE 3 (default case): simply convert the submittedAt parameter to the back-end format, and return it
        return dateF2B(submittedAt);
    };

    // FUNCTION 11: getPosition - determine the posititon of a new submission
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
        insertPositionToLevelboard, 
        dateB2F, 
        submission2Form,
        dateF2B,
        validateRecord,
        validateProof,
        validateComment,
        validateMessage,
        fixDateForSubmission,
        getPosition
    };
};

export default LevelboardHelper;