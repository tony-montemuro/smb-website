/* ===== IMPORTS ===== */
import FrontendHelper from "./FrontendHelper";

const DateHelper = () => {
    /* ===== FUNCTIONS ===== */

    // helper functions
    const { dateB2F } = FrontendHelper();
    
    // FUNCTION 1: dateF2B ("date frontend-to-backend") - converts a date paramter in a front-end format to a back-end format
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

    // FUNCTION 2: getDateOfSubmission - given the frontend date & oldSubmission data, determine the date of the new submission 
    // date
    // PRECONDITIONS (4 parameters):
    // 1.) submittedAt: a string representing a date with a front-end format
    // 2.) oldSubmittedAt: either a backend-formatted submitted at string associated with the "old" submission, or undefined, 
    // if there is no "old" submission
    // POSTCONDITIONS (1 return, 2 possible outcomes):
    // special case: if the submission date of the new submission is the same as that of the previous submission, but the records 
    // are different, the user will be notified that they likely made an error. if the user rejects the confirmation message, 
    // undefined returned
    // in all other cases, a string representing a date with the back-end format is returned
    const getDateOfSubmission = (submittedAt, oldSubmittedAt) => {
        // first, we need to handle defining the date differently if the user has a previous submissions
        if (oldSubmittedAt) {
            // convert 
			const prevDate = dateB2F(oldSubmittedAt);

			// CASE 1: the submission date from the form is equal to the "old" submission date. in this case, just return
            // the details.submitted_at field from the oldSubmission object
			if (submittedAt === prevDate) {
				return oldSubmittedAt;
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

    return { getDateOfSubmission };
};

/* ===== EXPORTS ===== */
export default DateHelper;