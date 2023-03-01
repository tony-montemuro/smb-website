import FrontendHelper from "./FrontendHelper";
import LevelboardUpdate from "../database/update/LevelboardUpdate";

const LevelboardHelper = () => {
    // helper functions from separate modules
    const { capitalize, dateB2F, recordB2F } = FrontendHelper();
    const { insertNotification } = LevelboardUpdate();

    // ===== INTERNAL MODULE FUNCTIONS ===== //

    // MODULE FUNCTION 1: getPosition - determine the posititon of a new submission
    // PRECONDITIONS (3 parameters):
    // 1.) record: a string representing a floating-point value
    // 2.) submissions: an array of submissions, ordered by position
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

    // ===== RETURNED FUNCTIONS ===== //

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

    // FUNCTION 2: getPrevAndNext - get the previous and next level names
    // PRECONDTIONS (2 parameters):
    // 1.) index: the index of the current level
    // 2.) levels: an array of levels, sorted by the id parameter
    // POSTCONDITIONS (2 returns):
    // 1.) prev: the name of the previous level. if it does not exist, value will be null 
    // 2.) next: the name of the next level. if it does not exist, value will be null
    const getPrevAndNext = (index, levels) => {
        let prev = null, next = null;
		if (index > 0) {
			prev = levels[index-1].name;
		}
		if (index < levels.length-1) {
			next = levels[index+1].name;
		}
        return { prev: prev, next: next };
    };

    // FUNCTION 3: insertPositionToLevelboard
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
                score: submission.score,
                monkey_id: details.monkey.id,
                region_id: details.region.id,
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
                score: game.type === "score" ? true : false,
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
    // POSTCONDITIONS (1 return):
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
    // POSTCONDITIONS (1 return):
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
    // POSTCONDITIONS (1 return):
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
    // PRECONDITIONS (2 parameters):
    // 1.) message: a string value representing the message of the submission
    // 2.) required: a boolean flag. if true, the function will require that message be a non-empty string. otherwise,
    // the function will accept an empty message
    // POSTCONDITIONS (1 return):
    // 1.) error: a string that either contains an error message, or undefined, if there is no error
    const validateMessage = (message, required) => {
        // first, if the message is required, and is empty, return an error
        if (required && message.length === 0) {
            return "Message is required!";
        }

        // check if the message is greater than 100 characters long
        if (message.length > 100) {
            return "Message must be 100 characters or less.";
        }

        // if we made it this far, the comment is valid! return undefined, since there is no error
        return undefined;
    };

    // FUNCTION 10: getDateOfSubmission
    // PRECONDITIONS (4 parameters):
    // 1.) submittedAt: a string representing a date with a front-end format
    // 2.) oldSubmission: either a submission object belonging to a user, or undefined, depending on whether the current
    // 3.) record: a string or float value representing the record that the user is submitting
    // 4.) type: a string value, either "score" or "time"
    // user has submitted to this chart
    // POSTCONDITIONS (1 return):
    // 1.) backendDate: a string representing a date with the back-end format, or, undefined. undefined is returned only if
    // a user is subitting a new record, but they realized they forgot to change the date
    const getDateOfSubmission = (submittedAt, oldSubmission, record, type) => {
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

    // FUNCTION 11: getSubmissionFromForm  - takes form values, and generates a new object with formatting ready for submission
    // PRECONDITIONS (4 parameter):
    // 1.) formVals: an object containing data generated from the submission form
    // 2.) date: a string representing the date of the submission. this is different from the `submitted_at` field already
    // present in the formVals object; it's converted to a backend format
    // 3.) id: a string that uniquely idenfies the current submission
    // 4.) submissions: an array of submissions, ordered by position
    // POSTCONDITION (1 return):
    // 1.) submission: an object containing mostly the same information from formValues parameter, but with
    // additional field values, as well as removing the `message` field
    const getSubmissionFromForm = (formVals, date, id, submissions) => {
        // create our new submission object, which is equivelent to formVals minus the message field
        const { message, ...submission } = formVals;

        // add additional fields to submission object
        submission.submitted_at = date;
        submission.id = id;
        submission.all_position = getPosition(submission.record, submissions);
		submission.position = submission.live ? getPosition(submission.record, submissions) : null;

        return submission;
    };

    // FUNCTION 12: handleNotification - determines if a submission needs a notification as well. if so, notification is inserted
    // to backend
    // PRECONDITIONS (3 parameters):
    // 1.) formVals: an object that contains data from the submission form
    // 2.) id: a string representing the unique id assigned to the current submission
    // 3.) userId: a string that represents the user id of the currently signed in user, NOT necessarily of
    // the person who submitted the submission
    // 4.) level: a string representing the name of the level
    // POSTCONDITION (0 returns):
    // this function will either generate a notification object and make a call to insert it into the database, or return early,
    // depending on whether this submission was sent from the owner of the submission, or a moderator
    const handleNotification = async (formVals, id, userId, level) => {
        // determine the user id belonging to the submission
        const submissionUserId = formVals.user_id;

        // if these two ids are not equal, it means a moderator is inserting a submission, so we need to notify the owner
        // of the submission of this action. if this condition is not met, the function will return early
        if (userId !== submissionUserId) {
			let notification = {
				notif_type: "insert",
				user_id: submissionUserId,
				creator_id: userId,
				message: formVals.message,
                level_id: level,
				submission_id: id
			};
			
			// insert the notification into the database
			await insertNotification(notification);
		}
    };

    return { 
        validateLevelboardPath, 
        getPrevAndNext,
        insertPositionToLevelboard, 
        submission2Form,
        dateF2B,
        validateRecord,
        validateProof,
        validateComment,
        validateMessage,
        getDateOfSubmission,
        getSubmissionFromForm,
        handleNotification
    };
};

export default LevelboardHelper;