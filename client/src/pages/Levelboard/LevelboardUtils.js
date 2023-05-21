/* ===== IMPORTS ===== */
import { GameContext } from "../../Contexts";
import { useContext } from "react";
import FrontendHelper from "../../helper/FrontendHelper";

const LevelboardUtils = () => {
    /* ===== CONTEXTS ===== */

    // game state from game context
    const { game } = useContext(GameContext);

    /* ===== FUNCTIONS ===== */

    // helper functions
    const { capitalize, dateB2F, recordB2F } = FrontendHelper();

    // FUNCTION 1: submission2Form ("submission to form")
    // PRECONDITIONS (4 parameters):
    // 1.) submission: a submission object, or undefined
    // 2.) type: a string, either "score" or "time"
    // 3.) levelName: a valid name of a level
    // 4.) profile: a profile integer that belongs to some profile, or is null
    // POSTCONDITIONS (2 possible outcomes, 1 return):
    // if submission is defined, we use the information from this object to define the return object
    // if not, we set many of the form values to their default values
    // the object returned is compatible with the submission form
    const submission2Form = (submission, type, levelName, profileId) => {
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

    // FUNCTION 2: dateF2B ("date frontend-to-backend") - converts a date paramter in a front-end format to a back-end format
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

    // FUNCTION 3: validateRecord - given a record field and type, validate the record
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

    // FUNCTION 4: validateProof - given a proof string, validate the proof
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

    // FUNCTION 5: validateComment - given a comment string, validate the comment
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

    // FUNCTION 6: getDateOfSubmission - given the frontend date & oldSubmission data, determine the date of the new submission 
    // date
    // PRECONDITIONS (4 parameters):
    // 1.) submittedAt: a string representing a date with a front-end format
    // 2.) oldSubmission: either a submission object belonging to a user, or undefined, depending on whether the current
    // user has submitted to this chart
    // POSTCONDITIONS (1 return, 2 possible outcomes):
    // special case: if the submission date of the new submission is the same as that of the previous submission, but the records 
    // are different, the user will be notified that they likely made an error. if the user rejects the confirmation message, 
    // undefined returned
    // in all other cases, a string representing a date with the back-end format is returned
    const getDateOfSubmission = (submittedAt, oldSubmission) => {
        // first, we need to handle defining the date differently if the user has a previous submissions
        if (oldSubmission) {
            // convert 
			const prevDate = dateB2F(oldSubmission.details.submitted_at);

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

    // FUNCTION 7: getPosition - determine the posititon of a new submission
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
        return submissions[i].position;
    };

    return {
        submission2Form, 
        dateF2B, 
        validateRecord,
        validateProof,
        validateComment,
        getDateOfSubmission,
        getPosition
    };
};

/* ===== EXPORTS ===== */
export default LevelboardUtils;