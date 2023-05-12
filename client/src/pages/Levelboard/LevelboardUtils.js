/* ===== IMPORTS ===== */
import { useContext } from "react";
import { UserContext } from "../../Contexts";
import FrontendHelper from "../../helper/FrontendHelper";
import NotificationUpdate from "../../database/update/NotificationUpdate";

const LevelboardUtils = () => {
    /* ===== CONTEXTS ===== */

    // user state from user context
    const { user } = useContext(UserContext);

    /* ===== FUNCTIONS ===== */

    // helper functions
    const { capitalize, dateB2F, recordB2F } = FrontendHelper();

    // database functions
    const { insertNotification } = NotificationUpdate();

    // FUNCTION 1: getPrevAndNext - get the previous and next level names
    // PRECONDTIONS (2 parameters):
    // 1.) game: an object containing information about the game defined in the path
    // 2.) category: the current category, either "main" or "misc", also defined in the path
    // 3.) levelName: a string corresponding to the name of a level, also defined in the path
    // POSTCONDITIONS (2 returns):
    // 1.) prev: the name of the previous level. if it does not exist, value will be null 
    // 2.) next: the name of the next level. if it does not exist, value will be null
    const getPrevAndNext = (game, category, levelName) => {
        // first, let's get the array of mode objects belonging to category
        const isMisc = category === "misc" ? true : false;
        const modes = game.mode.filter(row => row.misc === isMisc);

        // define our obj containing the prev and next variables
        const obj = { prev: null, next: null };

        // iterate through each level to find the match, so we can determine previous and next
        for (let i = 0; i < modes.length; i++) {
            const levelArr = modes[i].level;

            for (let j = 0; j < levelArr.length; j++) {
                const name = levelArr[j].name;
                if (name === levelName) {
                    // if the next element exists in the level array, set next to that.
                    // if NOT, now need to check if level array exists after current one. if so, set next to next array[0]
                    // if NOT EITHER, then next will remain set to null
                    obj.next = j+1 < levelArr.length ? levelArr[j+1].name : (i+1 < modes.length ? modes[i+1].level[0].name : null);
                    return obj;
                } else {
                    obj.prev = name;
                }
            }
        }
    };

    // FUNCTION 2: insertPositionToLevelboard - for each submission, add the position.details field
    // PRECONDITIONS (1 parameter):
    // 1.) submissions: an array of submission objects, ordered in descending order by details.record, then in ascending order
    // by details.submitted_at
    // POSTCONDITIONS (1 possible outcome): 
    // each submission object in the submissions array is updated to include position field, which accurately ranks each record
    // based on the details.record field
    const insertPositionToLevelboard = submissions => {
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

    // FUNCTION 3: submission2Form ("submission to form")
    // PRECONDITIONS (5 parameters):
    // 1.) submission: a submission object, or undefined
    // 2.) game: an object containing information about the game
    // 3.) type: a string, either "score" or "time"
    // 4.) levelName: a valid name of a level
    // 5.) profile: a profile integer that belongs to some profile, or is null
    // POSTCONDITIONS (2 possible outcomes, 1 return):
    // if submission is defined, we use the information from this object to define the return object
    // if not, we set many of the form values to their default values
    // the object returned is compatible with the submission form
    const submission2Form = (submission, game, type, levelName, profileId) => {
        // if a submission exists, we can use the data to form our formData object
        if (submission) {
            const details = submission.details;
            return {
                record: type === "time" ? recordB2F(details.record, type) : details.record,
                score: submission.score,
                monkey_id: details.monkey.id,
                region_id: details.region.id,
                live: details.live,
                proof: details.proof,
                comment: details.comment ? details.comment : "",
                profile_id: parseInt(profileId),
                game_id: game.abb,
                level_id: levelName,
                submitted_at: dateB2F(details.submitted_at),
                message: ""
            };

        // if not, we can fill the object with default data values
        } else {
            return {
                record: "",
                score: type === "score" ? true : false,
                monkey_id: game.monkey[0].id,
                region_id: game.region[0].id,
                live: true,
                proof: "",
                comment: "",
                profile_id: profileId,
                game_id: game.abb,
                level_id: levelName,
                submitted_at: dateB2F(),
                message: ""
            };
        }
    };

    // FUNCTION 4: dateF2B ("date frontend-to-backend") - converts a date paramter in a front-end format to a back-end format
    // PRECONDITIONS (1 parameter): 
    // 1.) date: a string, which can take two possible values:
        // a.) a date with the following format: YYYY-MM-DD
        // b.) null
    // POSTCONDITIONS (1 return, 2 possible outcomes):
    // if date is defined, we return the date with the following string appended to the end: YYYY-MM-DDTHH:MM:SS.***+00
    // if date is undefined, we return the current date with the same format
    const dateF2B = date => {
        return date ? date+"T12:00:00.000+00" : new Date().toISOString().replace("Z", "+00");
    };

    // FUNCTION 5: validateRecord - given a record field and type, validate the record
    // PRECONDITIONS (2 parameters):
    // 1.) recordField: a string value representing the record of the submission
    // 2.) type: a string value, either "score" or "time"
    // POSTCONDITIONS (1 return, 2 possible outcomes):
    // if the record is determined to be invalid, return a string that contains the error message
    // if the record is determined to be valid, return undefined
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

    // FUNCTION 6: validateProof - given a proof string, validate the proof
    // PRECONDITIONS (1 parameter):
    // 1.) proof: a string value representing the proof of the submission
    // POSTCONDITIONS (1 return, 2 possible outcomes):
    // if the proof is determined to be invalid, return a string that contains the error message
    // if the proof is determined to be valid, return undefined
    const validateProof = proof => {
        // check if the proof field is non-null
        if (!proof) {
            return "Proof is required.";
        }

        // if we made it this far, the comment is valid! return undefined, since there is no error
        return undefined;
    };

    // FUNCTION 7: validateComment - given a comment string, validate the comment
    // PRECONDITIONS (1 parameter):
    // 1.) comment: a string value representing the comment of the submission
    // POSTCONDITIONS (1 return, 2 possible outcomes):
    // if the comment is determined to be invalid, return a string that contains the error message
    // if the comment is determined to be valid, return undefined
    const validateComment = comment => {
        // check if the comment is greater than 100 characters long
        if (comment.length > 100) {
            return "Comment must be 100 characters or less.";
        }

        // if we made it this far, the comment is valid! return undefined, since there is no error
        return undefined;
    };

    // FUNCTION 8: getDateOfSubmission - given the frontend date, oldSubmission data, the new record, and type, determine the
    // date of the new submission date
    // PRECONDITIONS (4 parameters):
    // 1.) submittedAt: a string representing a date with a front-end format
    // 2.) oldSubmission: either a submission object belonging to a user, or undefined, depending on whether the current
    // 3.) record: a string or float value representing the record that the user is submitting
    // 4.) type: a string value, either "score" or "time"
    // user has submitted to this chart
    // POSTCONDITIONS (1 return, 2 possible outcomes):
    // special case: if the submission date of the new submission is the same as that of the previous submission, but the records 
    // are different, the user will be notified that they likely made an error. if the user rejects the confirmation message, 
    // undefined returned
    // in all other cases, a string representing a date with the back-end format is returned
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

    // FUNCTION 9: getPosition - determine the posititon of a new submission
    // PRECONDITIONS (2 parameters):
    // 1.) record: a string representing a floating-point value that corresponds to a record
    // 2.) submissions: an array of submissions, ordered by position
    // POSTCONDITIONS (1 possible outcome, 1 return):
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

    // FUNCTION 10: getSubmissionFromForm  - takes form values, and generates a new object with formatting ready for submission
    // PRECONDITIONS (4 parameter):
    // 1.) formVals: an object containing data generated from the submission form
    // 2.) date: a string representing the date of the submission. this is different from the `submitted_at` field already
    // present in the formVals object; it's converted to a backend format
    // 3.) id: a string that uniquely idenfies the current submission
    // 4.) submissions: an array of submissions, ordered by position
    // POSTCONDITION (1 possible outcome, 1 return):
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

    // FUNCTION 11: handleNotification - determines if a submission needs a notification as well. if so, notification is inserted
    // to backend
    // PRECONDITIONS (2 parameters):
    // 1.) formVals: an object that contains data from the submission form
    // 2.) id: a string representing the unique id assigned to the current submission
    // POSTCONDITION (2 possible outcomes):
    // if the current user does not own the submission, this function will generate a notification object and make a call to 
    // insert it into the database
    // if the current user does own the submission, this function returns early
    const handleNotification = async (formVals, id) => {
        // determine the user id belonging to the submission
        const submissionProfileId = formVals.profile_id;

        // if these two ids are not equal, it means a moderator is inserting a submission, so we need to notify the owner
        // of the submission of this action. if this condition is not met, the function will return early
        if (user.profile.id !== submissionProfileId) {
			let notification = {
				notif_type: "insert",
				profile_id: submissionProfileId,
				creator_id: user.profile.id,
				message: formVals.message,
                game_id: formVals.game_id,
                level_id: formVals.level_id,
                score: formVals.score,
                record: formVals.record,
				submission_id: id
			};
			
			// insert the notification into the database
			await insertNotification(notification);
		}
    };

    return { 
        getPrevAndNext, 
        insertPositionToLevelboard, 
        submission2Form, 
        dateF2B, 
        validateRecord,
        validateProof,
        validateComment,
        getDateOfSubmission,
        getSubmissionFromForm,
        handleNotification
    };
};

/* ===== EXPORTS ===== */
export default LevelboardUtils;