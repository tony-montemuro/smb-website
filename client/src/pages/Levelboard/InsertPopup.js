/* ===== IMPORTS ===== */
import { useContext, useReducer } from "react";
import { useLocation } from "react-router-dom";
import { MessageContext, UserContext } from "../../utils/Contexts";
import DateHelper from "../../helper/DateHelper";
import LevelboardUtils from "./LevelboardUtils";
import Submission2Update from "../../database/update/Submission2Update";
import ValidationHelper from "../../helper/ValidationHelper";

const InsertPopup = () => {
    /* ===== VARIABLES ===== */
    const location = useLocation();
    const path = location.pathname.split("/");
    const category = path[3];
    const type = path[4];
    const levelName = path[5];
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
    const { insertSubmission2 } = Submission2Update();

    // helper functions
    const { getDateOfSubmission } = DateHelper();
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
    // default form values are generated using the type and levelName parameters, and the form is updated by calling the 
    // dispatchForm() function
	const fillForm = () => {
		const formVals = submission2Form(null, type, levelName, category, user.profile.id);
		dispatchForm({ field: "values", value: formVals });
	};

    // FUNCTION 2: handleChange - function that is run each time the user modifies the form
	// PRECONDITIONS (1 parameter):
	// 1.) e: an event object generated when the user makes a change to the submission form
	// POSTCONDITIONS (3 possible outcomes):
	// if the field id is live or tas, we use the checked variable rather than the value variable to update the form
    // if the field id is profile_id, we will reset the entire form to default values
	// otherwise, we simply update the form field based on the value variable
    const handleChange = e => {
        const { id, value, checked } = e.target;
		switch (id) {
			// case 1: live. this is a checkbox, so we need to use the "checked" variable as our value
			case "live":
				dispatchForm({ field: "values", value: { live: checked } });
				break;

            // case 2: tas. also a checkbox, so we ened to use the "checked" variable as our value
            case "tas":
                dispatchForm({ field: "values", value: { tas: checked } });
                break;

            // case 3: profile_id. this is a special field that only moderators are able to change. if a moderator is trying to update
			// a record from a user that has already submitted to the chart, the form will be loaded with that user's submission data. 
			// otherwise, the form is set to the default values
			case "profile_id":
				const formData = submission2Form(null, type, levelName, category, parseInt(value));
				dispatchForm({ field: "values", value: formData });
				break;

			// default case: simply update the id field of the values object with the value variable
			default:
				dispatchForm({ field: "values", value: { [id]: value } });
		};
    };

    // FUNCTION 3: getSubmissionFromForm  - takes form values, and generates a new object with formatting ready for submission
    // PRECONDITIONS (5 parameter):
    // 1.) formVals: an object containing data generated from the submission form
    // 2.) date: a string representing the date of the submission. this is different from the `submitted_at` field already
    // present in the formVals object; it's converted to a backend format
    // POSTCONDITION (1 possible outcome, 1 return):
    // 1.) submission: an object containing mostly the same information from formValues parameter, but with
    // fixed date value (backend format), as well as removing the `message`, `hour`, `minute`, `second`, & `centisecond` fields
    const getSubmissionFromForm = (formVals, date) => {
        // create our new submission object, which is equivelent to formVals minus the message field
        const { hour, minute, second, centisecond, ...submission } = formVals;

        // add additional fields to submission object, and correct the record field if type is time
        submission.submitted_at = date;
        submission.record = type === "time" ? recordToSeconds(hour, minute, second, centisecond) : submission.record;

        return submission;
    };

    // FUNCTION 4: handleSubmit - function that validates and submits a record to the database
	// PRECONDITIONS (3 parameters):
	// 1.) e: an event object generated when the user submits the submission form
    // 2.) allSubmissions: an array of submissions for the current levelboard, sorted in descending order by the
    // details.record field
    // 3.) timerType: a string representing the time of timer of the chart. only really relevent for time charts
	// POSTCONDITIONS (3 possible outcomes):
    // if the submission fails to validate, the function will update the error field of the form state with any new form errors,
    // and return early
	// if the submission is validated, and the submission is successful, the page is reloaded
	// if the submission is validated, but the submission fails, and error message is rendered, and page does NOT reload
	const handleSubmit = async (e, allSubmissions, timerType) => {
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
		const oldSubmission = allSubmissions.find(row => row.profile.id === form.values.profile_id);
		const backendDate = getDateOfSubmission(form.values.submitted_at, oldSubmission ? oldSubmission.submitted_at : undefined);

		// if we made it this far, no errors were detected, so we can go ahead and submit
		const submission = getSubmissionFromForm(form.values, backendDate);
        
        try {
            // attempt to submit the submission, and grab submission id from db response
            await insertSubmission2(submission);

            // once all database updates have been finished, reload the page
            window.location.reload();

        } catch (error) {
            if (error.code === "42501" && error.message === 'new row violates row-level security policy "Enforce receiving profile exists [RESTRICTIVE]" for table "notification"') {
                // special case: moderator attempted to update a submission for a profile who is unauthenticated. this is actually
                // expected behavior, so let's proceed as if there were not issues
                window.location.reload();

            } else {
                // general case: if there is an error, inform the user
                addMessage(error.message, "error");
                dispatchForm({ field: "submitting", value: false });
            }
        };
	};

    // FUNCTION 6: closePopup - function that is activated when the user attempts to close the popup
    // PRECONDITIONS (1 parameter):
    // 1.) setPopup - function used to update the insertPopup state in Levelboard.jsx. when set to false, the popup will close
    // POSTCONDITIONS (1 possible outcomes):
    // the form is set to default values by calling the dispatchForm() function with the { field: "all" } argument, and the popup
    // is set to false
    const closePopup = (setPopup) => {
        dispatchForm({ field: "all" });
        setPopup(false);
    };

    return { form, fillForm, handleChange, handleSubmit, closePopup }; 
};

/* ===== EXPORTS ===== */
export default InsertPopup;