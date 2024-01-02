/* ===== IMPORTS ===== */
import { GameContext, MessageContext, PopupContext, UserContext } from "../../../utils/Contexts";
import { useContext, useReducer } from "react";
import { useLocation } from "react-router-dom";
import DateHelper from "../../../helper/DateHelper";
import FrontendHelper from "../../../helper/FrontendHelper";
import SubmissionUpdate from "../../../database/update/SubmissionUpdate";
import ValidationHelper from "../../../helper/ValidationHelper";

const Insert = (level, setSubmitting) => {
    /* ===== CONTEXTS ===== */

    // game state from game context
    const { game } = useContext(GameContext);

    // add message function from message context
    const { addMessage } = useContext(MessageContext);

    // close popup function from popup context
    const { closePopup } = useContext(PopupContext);

    // user state from user context
    const { user } = useContext(UserContext);

    /* ===== HELPER FUNCTIONS ===== */
    const { dateF2B } = DateHelper();
    const { capitalize, dateB2F } = FrontendHelper();
    const { validateVideoUrl, validateDate, validateLive } = ValidationHelper();

    /* ===== VARIABLES ===== */
    const location = useLocation();
    const path = location.pathname.split("/");
    const category = path[3];
    const type = path[4];
    const otherType = type === "score" ? "time" : "score";
    const defaultVals = {
        record: "",
        hour: "",
        minute: "",
        second: "",
        centisecond: "",
        both: false,
        score: type === "score",
        monkey_id: game.monkey[0].id,
        platform_id: game.platform[0].id,
        region_id: game.region[0].id,
        live: true,
        proof: "",
        comment: "",
        profile: user.profile,
        game_id: game.abb,
        level_id: level.name,
        category: category,
        submitted_at: dateB2F(),
        tas: false,
        mod_note: ""
    };
    const formInit = { 
		values: defaultVals, 
		error: { 
            record: null, 
            hour: null, 
            minute: null, 
            second: null, 
            centisecond: null, 
            proof: null, 
            submitted_at: null,
            live: null
        }
	};
    const MAX = 2147483647;
    const MAX_CENTISECOND = 99;

    /* ===== REDUCER FUNCTIONS ===== */

    // FUNCTION 1: reducer - function that executes each time the user attempts to update the from reducer hook
    // PRECONDITIONS (2 parameters):
    // 1.) state: the state of the form object when the function is called
    // 2.) action: an object with two fields:
        // a.) field: specifies which field of the form the reducer should modify
        // b.) value: specifies the new value that the reducer should use to modify form[field]
    // POSTCONDITIONS (3 possible outcomes):
    // if field is "values", this function will update the values state. in this case, `action.value` is expected to be an
    // object, and as such, one or more fields of `form.values` can be updated. any fields in `form.values` that have a corresponding
    // error in `form.error` are also reset to default value (undefined)
    // if the field is "all", the form is reset back to it's default state
    // otherwise, this function expects `action.field` to be a string representing a valid form field, and `value` to be a single
    // value
    const reducer = (state, action) => {
        const field = action.field, value = action.value;
		switch(field) {
			case "values":
                // generate error object using `state.error`, and `value`
                const error = {};
                Object.keys(value).forEach(key => {
                    if (key in state.error) error[key] = undefined;
                });

				return {
					...state,
                    error: {
                        ...state.error,
                        ...error
                    },
					values: {
						...state.values,
						...value
					}
				};
			case "all":
				return formInit;
			default:
				return { ...state, [field]: value };
		}
	};

    /* ====== REDUCERS ===== */
    const [form, dispatchForm] = useReducer(reducer, formInit);

    /* ===== FUNCTIONS ===== */

    // database functions
    const { insertSubmission } = SubmissionUpdate();

    // FUNCTION 1: handleChange - function that is run each time the user modifies the form
	// PRECONDITIONS (1 parameter):
	// 1.) e: an event object generated when the user makes a change to the submission form
	// POSTCONDITIONS (3 possible outcomes):
	// if the field id is live or tas, we use the checked variable rather than the value variable to update the form
	// otherwise, we simply update the form field based on the value variable
    const handleChange = e => {
        // get variables from e.target
        const { id, value, checked } = e.target;

        // special case: updating a checkbox field
        if (["live", "tas", "both"].includes(id)) {
            dispatchForm({ field: "values", value: { [id]: checked } });
        }

        // general case: updating a "normal" field
        else {
            dispatchForm({ field: "values", value: { [id]: value } });
        }
    };

    // FUNCTION 2: handleSubmittedAtChange - handle a change to the `submitted_at` field in the submission form
    // PRECONDITIONS (1 parameter):
    // 1.) e: an event object that is generated when the user makes a change to the `submitted_at` field of the submission form
    // POSTCONDITIONS (1 possible outcome):
    // the `submitted_at` field is updated using the date the user selected by the date picker
    const handleSubmittedAtChange = e => {
        let submitted_at = null;
        if (e) {
            let { $d: date } = e;
            const year = date.getFullYear();
            const month = String(date.getMonth()+1).padStart(2, "0");
            const day = String(date.getDate()).padStart(2, "0");
            submitted_at = `${ year }-${ month }-${ day }`;
        }
        dispatchForm({ field: "values", value: { submitted_at } });
    };

    // FUNCTION 3: onUserRowClick - function that is called when a moderator selects a user
    // PRECONDITIONS (1 parameter):
    // 1.) profile: a profile object, containing at least the id, username, and country fields
    // POSTCONDITIONS (2 possible outcomes):
    // if profileId is the same as the profile id in our form, do nothing
    // if profileId differs from profile id in our form, reset form to default values, with our new profile
    const onUserRowClick = profile => {
        if (profile.id !== form.values.profile.id) {
            dispatchForm({ field: "values", value: defaultVals });
        }
    };

    // FUNCTION 4: validateRecord - given a record field and type, validate the record
    // PRECONDITIONS (2 parameters):
    // 1.) recordField: a string value representing the record of the submission
    // 2.) type: a string value, either "score" or "time"
    // POSTCONDITIONS (1 return, 2 possible outcomes):
    // if the record is determined to be invalid, return a string that contains the error message
    // if the record is determined to be valid, return undefined
    const validateRecord = (recordField, type) => {
        const record = parseInt(recordField);
        if (record > MAX) {
            return `${ capitalize(type) } is invalid.`;
        }
        return undefined;
    };

    // FUNCTION 5: validateHour - given the hour field & timerType, validate the hour field
    // PRECONDITIONS (2 parameters):
    // 1.) hourField: a string value representing the hours of the submission
    // 2.) timerType: a string representing the timer type of the chart, which has an influence on how to validate this field
    // POSTCONDITIONS (1 return, 2 possible outcomes):
    // if the field is determined to be valid, return undefined
    // if the field is determined to be invalid, return a string that contains the error message
    const validateHour = (hourField, timerType) => {
        // first, if the timerType is "hour", this field is required
        if (timerType === "hour" && !hourField) {
            return "This field is required.";
        }

        // next, validate that hours is not too large
        const hour = parseInt(hourField);
        if (hour > MAX) {
            return "Invalid value.";
        }

        return undefined;
    };

    // FUNCTION 6: validateMinute - given the minute field & timerType, validate the minute field
    // PRECONDITIONS (2 parameters):
    // 1.) minuteField: a string value representing the minutes of the submission
    // 2.) timerType: a string representing the timer type of the chart, which has an influence on how to validate this field
    // POSTCONDITIONS (1 return, 2 possible outcomes):
    // if the field is determined to be valid, return undefined
    // if the field is determined to be invalid, return a string that contains the error message
    const validateMinute = (minuteField, timerType) => {
        // first, if the timerType is "min", this field is required
        if (timerType === "min" && !minuteField) {
            return "This field is required.";
        }

        // next, validate that minutes is not too large
        const minute = parseInt(minuteField);
        if (minute > MAX) {
            return "Invalid value.";
        }

        // next, if the "min" is at the middle or end of the timerType, we need to set it's max value to 60
        if (["hour_min", "hour_min_sec", "hour_min_sec_csec"].includes(timerType) && minute >= 60) {
            return "This field cannot exceed the value 59.";
        }

        return undefined;
    };

    // FUNCTION 7: validateSecond - given the second field & timerType, validate the second field
    // PRECONDITIONS (2 parameters):
    // 1.) secondField: a string value representing the seconds of the submission
    // 2.) timerType: a string representing the timer type of the chart, which has an influence on how to validate this field
    // POSTCONDITIONS (1 return, 2 possible outcomes):
    // if the field is determined to be valid, return undefined
    // if the field is determined to be invalid, return a string that contains the error message
    const validateSecond = (secondField, timerType) => {
        // first, if the timerType is "sec", this field is required
        if (timerType === "sec" && !secondField) {
            return "This field is required.";
        }

        // next, ensure second field is of reasonable size (relatively arbitrary, but the max integer value should suffice for now)*
        const second = parseInt(secondField);
        if (second > MAX) {
            return "Invalid value.";
        }

        // next, if the "sec" is at the middle or end of the timerType, we need to set it's max value to 60
        if (["min_sec", "min_sec_csec", "hour_min_sec", "hour_min_sec_csec"].includes(timerType) && second >= 60) {
            return "This field cannot exceed the value 59.";
        }

        return undefined;
    };

    // FUNCTION 8: validateCentisecond - given the centisecond field & timerType, validate the centisecond field
    // PRECONDITIONS (2 parameters):
    // 1.) centisecondField: a string value representing the centiseconds of the submission
    // 2.) timerType: a string representing the timer type of the chart, which has an influence on how to validate this field
    // POSTCONDITIONS (1 return, 2 possible outcomes):
    // if the field is determined to be valid, return undefined
    // if the field is determined to be invalid, return a string that contains the error message
    const validateCentisecond = (centisecondField, timerType) => {
        // first, if the timerType is "csec", this field is required
        if (timerType === "csec" && !centisecondField) {
            return "Decimals are required.";
        }

        // next, ensure this field has a max value of MAX_CENTISECOND
        const centisecond = parseInt(centisecondField);
        if (centisecond > MAX_CENTISECOND) {
            return `Decimals cannot exceed the value ${ MAX_CENTISECOND }.`;
        }

        return undefined;
    };

    // FUNCTION 9: recordToSeconds - function that takes the parts of the time submission (hour, minute, second, and centisecond)
    // and converts to a single float value in seconds
    // PRECONDITIONS (4 parameters):
    // 1.) hourField: a string value representing the hours of the submission
    // 2.) minuteField: a string value representing the minutes of the submission
    // 3.) secondField: a string value representing the seconds of the submission
    // 4.) centisecondField: a string value representing the centiseconds of the submission
    // POSTCONDITIONS (1 return, 1 possible outcome):
    // the parameters are used to compute the final time value in seconds, and this value is returned
    const recordToSeconds = (hourField, minuteField, secondField, centisecondField) => {
        // first, define our time float, and parse all inputs to their integer value
        let time = 0;
        const hour = parseInt(hourField), minute = parseInt(minuteField), second = parseInt(secondField), centisecond = parseInt(centisecondField);

        // next, let's perform the necessary math for each parameter
        if (hour) time += (hour*3600);
        if (minute) time += (minute*60);
        if (second) time += second;
        if (centisecond) time += (centisecond/100);

        return time;
    };

    // FUNCTION 10: getDateOfSubmission - given date from form data, determine new, backend-formatted submission date
    // PRECONDITIONS (1 parameter):
    // 1.) submittedAt: the date of the submission, coming from `form.values.submitted_at`
    // POSTCONDITIONS (2 possible outcomes):
    // if the submission date is just the current date, return null. we will allow the DB to define `submitted_at`, in this case
    // otherwise, return call to `dateF2B` with submittedAt as an argument
    const getDateOfSubmission = submittedAt => {
        const currDate = dateB2F();
        return submittedAt === currDate ? null : dateF2B(submittedAt);
    };

    // FUNCTION 11: getSubmissionsFromForm  - takes form values, and generates an array of new objects with formatting ready for submission
    // PRECONDITIONS (1 parameter):
    // 1.) formVals: an object containing data generated from the submission form
    // POSTCONDITION (1 possible outcome):
    // an array of submission objects containing mostly the same information from formValues parameter is returned, but with
    // fixed date value (backend format), as well as removing the `message`, `hour`, `minute`, `second`, & `centisecond` fields
    const getSubmissionsFromForm = formVals => {
        // create our new submission object, which is equivelent to formVals minus some fields not present in `submission` table
        let submissions = [];
        const { hour, minute, second, centisecond, both, profile, submitted_at, ...submission } = formVals;
        const backendDate = getDateOfSubmission(submitted_at);
        if (backendDate) submission.submitted_at = backendDate;
        submission.profile_id = profile.id;

        // now, add to submissions array, depending on the truthiness of `both`
        if (both) {
            submissions.push({ ...submission, score: true });
            const time = { 
                ...submission, 
                score: false, 
                record: recordToSeconds(hour, minute, second, centisecond) 
            };
            type === "score" ? submissions.push(time) : submissions.unshift(time);    
        } else {
            submissions.push({ 
                ...submission, 
                record: type === "time" ? recordToSeconds(hour, minute, second, centisecond) : submission.record 
            });
        }

        console.log(submissions);
        return submissions;
    };

    // FUNCTION 12: handlePromise - function that takes a promise, and attempts to fulfill it
    // PRECONDITIONS (1 parameter):
    // 1.) promise: a promise object, which we need to await to fulfill
    // POSTCONDITIONS (2 possible outcomes):
    // if the promise resolves, return a simple object with the status of "fulfilled"
    // if the promise rejects, return an object with the status of "rejected", and the reason being the error
    const handlePromise = async promise => {
        try {
            await promise;
            return { status: "fulfilled" };
        } catch (error) {
            return { status: "rejected", reason: error };
        };
    };

    // FUNCTION 13: handleResults - function that takes two results, and decides how to proceed
    // PRECONDITIONS (3 parameters):
    // 1.) r1: a result object from query 1
    // 2.) r2: a result object from query 2
    // 3.) updateBoard: a function that, when called, updates the board state displaying all the submissions
    // POSTCONDITIONS (2 possible outcomes):
    // if r1 resolves to fulfilled, this function will update the board, render a message depending on r2's status, and closes the popup
    // if r2 resolves to rejected, this function will keep the popup, and render a message / handle the form based on r1's status
    const handleResults = async (r1, r2, updateBoard) => {
        console.log(r1,r2);
        if (r1.status === "fulfilled") {
            await updateBoard();
            if (r2.status === "fulfilled") {
                addMessage("Both submissions were successful!", "success", 5000);
            } else {
                addMessage(`Your ${ type } submission succesfully added, but there was a problem adding your ${ otherType } submission. Try again on the ${ otherType } chart.`, "error", 15000);
            }
            closePopup();
        }

        else {
            if (r2.status === "fulfilled") {
                dispatchForm({ field: "values", value: { both: false } });
                if (type === "time") {
                    dispatchForm({ field: "values", value: { record: defaultVals.record } });
                } else {
                    const { hour, minute, second, centisecond } = defaultVals;
                    dispatchForm({ 
                        field: "values", 
                        value: { hour, minute, second, centisecond }
                    });
                }
                addMessage(`Your ${ otherType } submission succesfully added, but there was a problem adding your ${ type } submission. Try again or refresh the page.`, "error", 15000);
            } else {
                addMessage("There was a problem adding both of your submissions. Try refreshing the page.", "error", 10000);
            }
        }
    };

    // FUNCTION 14: handleSubmit - function that validates and submits a record to the database
	// PRECONDITIONS (3 parameters):
	// 1.) e: an event object generated when the user submits the submission form
    // 2.) timerType: a string representing the time of timer of the chart. only really relevent for time charts
    // 3.) updateBoard: a function that, when called, updates the board state displaying all the submissions
	// POSTCONDITIONS (3 possible outcomes):
    // if the submission fails to validate, the function will update the error field of the form state with any new form errors,
    // and return early
	// if the submission is validated, and the submission is successful, the page is reloaded
	// if the submission is validated, but the submission fails, and error message is rendered, and page does NOT reload
	const handleSubmit = async (e, timerType, updateBoard) => {
		// initialize submission
		e.preventDefault();

		// create an error object that will store error messages for each field value that needs to
		// be validated
		const error = {};
		Object.keys(form.error).forEach(field => error[field] = undefined);

		// perform form validation
        let allBlank = false;
        if (type === "score" || (type === "time" && form.values.both)) {
            error.record = validateRecord(form.values.record, type);
        } 
        if (type === "time" || (type === "score" && form.values.both)) {
            error.hour = validateHour(form.values.hour, timerType);
            error.minute = validateMinute(form.values.minute, timerType);
            error.second = validateSecond(form.values.second, timerType);
            error.centisecond = validateCentisecond(form.values.centisecond, timerType);
            allBlank = !form.values.hour && !form.values.minute && !form.values.second && !form.values.centisecond;
        }
		error.proof = validateVideoUrl(form.values.proof);
        error.submitted_at = validateDate(form.values.submitted_at);
        error.live = validateLive(form.values.live, form.values.proof);

		// if any errors are determined, let's return
        dispatchForm({ field: "error", value: error });
		if (Object.values(error).some(e => e !== undefined)) {
            addMessage("One or more form fields had errors.", "error", 7000);
            return;
        }
        if (allBlank) {
            addMessage("Cannot submit without a time.", "error", 7000);
            return;
        }

		// if we made it this far, no errors were detected, so we can go ahead and submit
		const submissions = getSubmissionsFromForm(form.values);
        setSubmitting(true);
        const submission = submissions.shift(), otherSubmission = submissions.shift();
        const r1 = await handlePromise(insertSubmission(submission));

        // if both is set to false, we only need to worry about a single result
        if (!form.values.both) {
            if (r1.status === "fulfilled") {
                await updateBoard();
                addMessage("Your submission was successful!", "success", 5000);
                closePopup();
            } else {
                addMessage("There was a problem adding your submission. Try refreshing the page.", "error", 8000);
            }
        } 
        
        // otherwise, we need to submit the next submission, and handle any errors from both results
        else {
            const r2 = await handlePromise(insertSubmission(otherSubmission));
            await handleResults(r1, r2, updateBoard);
        }

        // finally, set submitting to false
        setSubmitting(false);
	};

    return { form, handleChange, handleSubmittedAtChange, onUserRowClick, handleSubmit }; 
};

/* ===== EXPORTS ===== */
export default Insert;