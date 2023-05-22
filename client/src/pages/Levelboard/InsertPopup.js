/* ===== IMPORTS ===== */
import { useContext, useReducer } from "react";
import { useLocation } from "react-router-dom";
import { UserContext } from "../../Contexts";
import AllSubmissionUpdate from "../../database/update/AllSubmissionUpdate";
import LevelboardUtils from "./LevelboardUtils";
import NotificationUpdate from "../../database/update/NotificationUpdate";
import ValidationHelper from "../../helper/ValidationHelper";

const InsertPopup = () => {
    /* ===== VARIABLES ===== */
    const location = useLocation();
    const path = location.pathname.split("/");
    const type = path[4];
    const levelName = path[5];
    const formInit = { 
		values: null, 
		error: { record: null, proof: null, comment: null, message: null },
		submitting: false
	};

    /* ===== CONTEXTS ===== */

    // user state from user context
    const { user } = useContext(UserContext);

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
    const { insertSubmission } = AllSubmissionUpdate();
    const { insertNotification } = NotificationUpdate();

    // helper functions
    const { submission2Form, validateComment, validateProof, validateRecord, getDateOfSubmission, dateF2B, getPosition } = LevelboardUtils();
    const { validateMessage } = ValidationHelper();

    // FUNCTION 1 - fillForm - function that is called when the popup activates
    // PRECONDITIONS: NONE
    // POSTCONDITIONS (1 possible outcome)
    // default form values are generated using the type and levelName parameters, and the form is updated by calling the 
    // dispatchForm() function
	const fillForm = () => {
		const formVals = submission2Form(null, type, levelName, user.profile.id);
		dispatchForm({ field: "values", value: formVals });
	};

    // FUNCTION 2: handleChange - function that is run each time the user modifies the form
	// PRECONDITIONS (1 parameter):
	// 1.) e: an event object generated when the user makes a change to the submission form
	// POSTCONDITIONS (3 possible outcomes):
	// if the field id is live, we use the checked variable rather than the value variable to update the form
    // if the field id is profile_id, we will reset the entire form to default values
	// otherwise, we simply update the form field based on the value variable
    const handleChange = (e) => {
        const { id, value, checked } = e.target;
		switch (id) {
			// case 1: live. this is a checkbox, so we need to use the "checked" variable as our value
			case "live":
				dispatchForm({ field: "values", value: { [id]: checked } });
				break;

            // case 2: profile_id. this is a special field that only moderators are able to change. if a moderator is trying to update
			// a record from a user that has already submitted to the chart, the form will be loaded with that user's submission data. 
			// otherwise, the form is set to the default values
			case "profile_id":
				const formData = submission2Form(null, type, levelName, parseInt(value));
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
    // 3.) id: a string that uniquely idenfies the current submission
    // 4.) allSubmissions: an array of all submissions, regardless of live status, ordered by position
    // 5.) liveSubmissions: an array of live-only submissions, ordered by position
    // POSTCONDITION (1 possible outcome, 1 return):
    // 1.) submission: an object containing mostly the same information from formValues parameter, but with
    // additional field values, as well as removing the `message` field
    const getSubmissionFromForm = (formVals, date, id, allSubmissions, liveSubmissions) => {
        // create our new submission object, which is equivelent to formVals minus the message field
        const { message, ...submission } = formVals;
        const record = parseFloat(submission.record);

        // add additional fields to submission object
        submission.submitted_at = date;
        submission.id = id;
        submission.all_position = getPosition(record, allSubmissions);
		submission.position = submission.live ? getPosition(record, liveSubmissions) : null;

        return submission;
    };

    // FUNCTION 4: handleNotification - determines if a submission needs a notification as well. if so, notification is inserted
    // to backend
    // PRECONDITIONS (4 parameters):
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

    // FUNCTION 5: handleSubmit - function that validates and submits a record to the database
	// PRECONDITIONS (1 parameter):
	// 1.) e: an event object generated when the user submits the submission form
	// POSTCONDITIONS (3 possible outcomes):
	// if the submission is validated, it is submitted to the database, as well as a notification, if necessary
	// and the page is reloaded
	// if not, the function will update the error field of the form state with any new form errors, and return early
	const handleSubmit = async (e, allSubmissions, liveSubmissions) => {
		// initialize submission
		e.preventDefault();
		dispatchForm({ field: "submitting", value: true });

		// create an error object that will store error messages for each field value that needs to
		// be validated
		const error = {};
		Object.keys(form.error).forEach(field => error[field] = undefined);

		// perform form validation
		error.record = validateRecord(form.values.record, type);
		error.proof = validateProof(form.values.proof);
		error.comment = validateComment(form.values.comment);
		error.message = validateMessage(form.values.message, false);

		// if any errors are determined, let's return
        dispatchForm({ field: "error", value: error });
		if (Object.values(error).some(e => e !== undefined)) {
            dispatchForm({ field: "submitting", value: false });
            return;
        }

		// convert the date from the front-end format, to the backend format.
		const oldSubmission = allSubmissions.find(row => row.profile.id === form.values.profile_id);
		const backendDate = getDateOfSubmission(form.values.submitted_at, oldSubmission);

		// if we made it this far, no errors were detected, so we can go ahead and submit
		const id = dateF2B();
		const submission = getSubmissionFromForm(form.values, backendDate, id, allSubmissions, liveSubmissions);
        
        try {
            // attempt to submit the submission
            await insertSubmission(submission);

            // next, handle notification
            await handleNotification(form.values, id);

            // once all database updates have been finished, reload the page
            window.location.reload();

        } catch (error) {
            if (error.code === "42501" && error.message === 'new row violates row-level security policy "Enforce receiving profile exists [RESTRICTIVE]" for table "notification"') {
                // special case: moderator attempted to update a submission for a profile who is unauthenticated. this is actually
                // expected behavior, so let's proceed as if there were not issues
                window.location.reload();

            } else {
                // general case: if there is an error, inform the user
                console.log(error);
                alert(error.message);
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