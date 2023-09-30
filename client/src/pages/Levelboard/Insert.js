/* ===== IMPORTS ===== */
import { MessageContext, PopupContext, UserContext } from "../../utils/Contexts";
import { useContext, useReducer } from "react";
import { useLocation } from "react-router-dom";
import DateHelper from "../../helper/DateHelper";
import FrontendHelper from "../../helper/FrontendHelper";
import LevelboardUtils from "./LevelboardUtils";
import SubmissionUpdate from "../../database/update/SubmissionUpdate";
import ValidationHelper from "../../helper/ValidationHelper";

const Insert = (level) => {
    /* ===== VARIABLES ===== */
    const location = useLocation();
    const path = location.pathname.split("/");
    const category = path[3];
    const type = path[4];
    const formInit = { 
		values: null, 
		error: { 
            record: null, 
            hour: null, 
            minute: null, 
            second: null, 
            centisecond: null, 
            proof: null, 
            comment: null, 
            message: null 
        },
		submitting: false
	};

    /* ===== CONTEXTS ===== */

    // user state from user context
    const { user } = useContext(UserContext);

    // close popup function from popup context
    const { closePopup } = useContext(PopupContext);

    // add message function from message context
    const { addMessage } = useContext(MessageContext);

    /* ====== STATES & REDUCERS ===== */
    const [form, dispatchForm] = useReducer((state, action) => {
		switch(action.field) {
			case "values":
				return {
					...state,
					[action.field]: {
						...state[action.field],
						...action.value
					}
				};
			case "all":
				return formInit;
			default:
				return { ...state, [action.field]: action.value };
		}
	}, formInit);

    /* ===== FUNCTIONS ===== */

    // database functions
    const { insertSubmission } = SubmissionUpdate();

    // helper functions
    const { dateF2B } = DateHelper();
    const { dateB2F } = FrontendHelper();
    const { 
        submission2Form, 
        validateRecord, 
        validateHour, 
        validateMinute, 
        validateSecond, 
        validateCentisecond, 
        recordToSeconds
    } = LevelboardUtils();
    const { validateProof, validateComment } = ValidationHelper();

    // FUNCTION 1 - fillForm - function that is called when the popup activates
    // PRECONDITIONS: NONE
    // POSTCONDITIONS (1 possible outcome)
    // default form values are generated using the type, level, category, and user.profile.id arguments, and the form is updated 
    // by calling the dispatchForm() function
	const fillForm = level => {
		const formVals = submission2Form(null, type, level, category, user.profile);
		dispatchForm({ field: "values", value: formVals });
	};

    // FUNCTION 2: handleChange - function that is run each time the user modifies the form
	// PRECONDITIONS (1 parameter):
	// 1.) e: an event object generated when the user makes a change to the submission form
	// POSTCONDITIONS (3 possible outcomes):
	// if the field id is live or tas, we use the checked variable rather than the value variable to update the form
	// otherwise, we simply update the form field based on the value variable
    const handleChange = e => {
        // get variables from e.target
        const { id, value, checked } = e.target;

        // special case: updating a checkbox field
        if (id === "live" || id === "tas") {
            dispatchForm({ field: "values", value: { [id]: checked } });
        }

        // general case: updating a "normal" field
        else {
            dispatchForm({ field: "values", value: { [id]: value } });
        }
    };

    // FUNCTION 3: onUserRowClick - function that is called when a moderator selects a user
    // PRECONDITIONS (1 parameter):
    // 1.) profile: a profile object, containing at least the id, username, and country fields
    // POSTCONDITIONS (2 possible outcomes):
    // if profileId is the same as the profile id in our form, do nothing
    // if profileId differs from profile id in our form, reset form to default values, with our new profile
    const onUserRowClick = profile => {
        if (profile.id !== form.values.profile.id) {
            const formData = submission2Form(null, type, level, category, profile);
            dispatchForm({ field: "values", value: formData });
        }
    };

    // FUNCTION 4: getDateOfSubmission - given date from form data, determine new, backend-formatted submission date
    // PRECONDITIONS (1 parameter):
    // 1.) submittedAt: the date of the submission, coming from `form.values.submitted_at`
    // POSTCONDITIONS (2 possible outcomes):
    // if the submission date is just the current date, return null. we will allow the DB to define `submitted_at`, in this case
    // otherwise, return call to `dateF2B` with submittedAt as an argument
    const getDateOfSubmission = submittedAt => {
        const currDate = dateB2F();
        return submittedAt === currDate ? null : dateF2B(submittedAt);
    };

    // FUNCTION 5: getSubmissionFromForm  - takes form values, and generates a new object with formatting ready for submission
    // PRECONDITIONS (2 parameters):
    // 1.) formVals: an object containing data generated from the submission form
    // 2.) date: a string representing the date of the submission (backend format), or null. if the date is null, this means that
    // we want the DB to just auto assign the `submitted_at` with the current timestamp
    // POSTCONDITION (1 possible outcome, 1 return):
    // 1.) submission: an object containing mostly the same information from formValues parameter, but with
    // fixed date value (backend format), as well as removing the `message`, `hour`, `minute`, `second`, & `centisecond` fields
    const getSubmissionFromForm = (formVals, date) => {
        // create our new submission object, which is equivelent to formVals minus some fields not present in `submission` table
        const { hour, minute, second, centisecond, profile, submitted_at, ...submission } = formVals;

        // add additional fields to submission object, and correct the record field if type is time
        if (date) {
            submission.submitted_at = date;
        }
        submission.record = type === "time" ? recordToSeconds(hour, minute, second, centisecond) : submission.record;
        submission.profile_id = profile.id;

        return submission;
    };

    // FUNCTION 6: handleSubmit - function that validates and submits a record to the database
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
		dispatchForm({ field: "submitting", value: true });

		// create an error object that will store error messages for each field value that needs to
		// be validated
		const error = {};
		Object.keys(form.error).forEach(field => error[field] = undefined);

		// perform form validation
        let allBlank = false;
        if (type === "score") {
            error.record = validateRecord(form.values.record, type);
        } else {
            error.hour = validateHour(form.values.hour, timerType);
            error.minute = validateMinute(form.values.minute, timerType);
            error.second = validateSecond(form.values.second, timerType);
            error.centisecond = validateCentisecond(form.values.centisecond, timerType);
            allBlank = !form.values.hour && !form.values.minute && !form.values.second && !form.values.centisecond;
        }
		error.proof = validateProof(form.values.proof);
		error.comment = validateComment(form.values.comment);

		// if any errors are determined, let's return
        dispatchForm({ field: "error", value: error });
		if (Object.values(error).some(e => e !== undefined)) {
            dispatchForm({ field: "submitting", value: false });
            addMessage("One or more form fields had errors.", "error");
            return;
        }

        // special case: if allBlank is true, render a special error message to the screen, and return early
        if (allBlank) {
            addMessage("Cannot submit without a time.", "error");
            return;
        }

		// convert the date from the front-end format, to the backend format.
		const backendDate = getDateOfSubmission(form.values.submitted_at);

		// if we made it this far, no errors were detected, so we can go ahead and submit
		const submission = getSubmissionFromForm(form.values, backendDate);
        
        try {
            // attempt to submit the submission, and grab submission id from db response
            await insertSubmission(submission);

            // wait for the board to update
            await updateBoard();

            // finally, let the user know that they successfully submitted their submission, and close popup
            addMessage("Your submission was successful!", "success");
            closePopup();

        } catch (error) {
            // otherwise, render an error message, and keep popup open
            addMessage(error.message, "error");
            dispatchForm({ field: "submitting", value: false });
        };
	};

    return { form, fillForm, handleChange, onUserRowClick, handleSubmit }; 
};

/* ===== EXPORTS ===== */
export default Insert;