/* ===== IMPORTS ===== */
import { useReducer } from "react";
import AllSubmissionUpdate from "../../database/update/AllSubmissionUpdate";
import LevelboardUtils from "./LevelboardUtils";

const UpdatePopup = () => {
    /* ===== VARIABLES ===== */
    const updateFormInit = {
		values: null,
		error: { proof: null, comment: null },
        submitting: false
	};

    /* ===== STATES & REDUCERS ===== */
    const [form, dispatchForm] = useReducer((state, action) => {
		switch (action.field) {
			case "values":
				return {
					...state,
					[action.field]: {
						...state[action.field],
						...action.value
					}
				};
			default:
				return { ...state, [action.field]: action.value };
		}
	}, updateFormInit);

    /* ===== FUNCTIONS ===== */

    // database functions
    const { updateSubmission } = AllSubmissionUpdate(); 

    // helper functions
    const { 
        submission2Form, 
        validateComment, 
        validateProof, 
        getDateOfSubmission
    } = LevelboardUtils();

    // FUNCTION 1 - fillForm - function that is called when the popup activates
	const fillForm = (submission, type, levelName, profileId) => {
		const formVals = submission2Form(submission, type, levelName, profileId);
		dispatchForm({ field: "values", value: formVals });
	};

    // FUNCTION 2: handleChange - function that is called whenever the user makes any change to the form
    // PRECONDITIONS (1 parameter)
	// 1.) e: an event object generated when the user makes a change to the form
	// POSTCONDITIONS (2 possible outcomes):
	// if the field id is live, we use the checked variable rather than the value variable to update the form
	// otherwise, we simply update the form field based on the value variable
	const handleChange = (e) => {
        const { id, value, checked } = e.target;
		switch (id) {
			// case 1: live. this is a checkbox, so we need to use the "checked" variable as our value
			case "live":
				dispatchForm({ field: "values", value: { [id]: checked } });
				break;

			// default case: simply update the id field of the values object with the value variable
			default:
				dispatchForm({ field: "values", value: { [id]: value } });
		};
    };

    // FUNCTION 3: getSubmissionFromForm - takes form data, and converts to a submission object
    const getSubmissionFromForm = (formVals, date, id, oldSubmission) => {
        // create our new submission object, which is equivelent to formVals minus the message field
        const { message, ...submission } = formVals;

        // add additional fields to submission object
        submission.submitted_at = date;
        submission.id = id;

        // position fields are NOT updated when a submission is updated!
        submission.all_position = oldSubmission.all_position;
		submission.position = oldSubmission.position;

        return submission;
    };

    // FUNCTION 4: handleSubmit - function that is called when the user submits the form
    const handleSubmit = async (e, submission) => {
        // initialize submission
		e.preventDefault();
		dispatchForm({ field: "submitting", value: true });

        // create an error object that will store error messages for each field value that needs to
		// be validated
		const error = {};
		Object.keys(form.error).forEach(field => error[field] = undefined);

        // perform form validation
		error.proof = validateProof(form.values.proof);
		error.comment = validateComment(form.values.comment);

        // if any errors are determined, let's return
        dispatchForm({ field: "error", value: error });
		if (Object.values(error).some(row => row !== undefined)) {
            dispatchForm({ field: "submitting", value: false });
            return;
        }

        // finally, let's convert the date from the front-end format, to the backend format.
		const backendDate = getDateOfSubmission(form.values.submitted_at, submission);

        // if we made it this far, no errors were detected, so we can go ahead and submit
		const id = submission.details.id;
		const updatedSubmission = getSubmissionFromForm(form.values, backendDate, id, submission);

        try {
            // attempt to update the submission
            await updateSubmission(updatedSubmission);

            // reload the page
            window.location.reload();

        } catch (error) {
            // if there is an error, inform the user
            console.log(error.message);
            alert(error);
        };
    };

    return { form, fillForm, handleChange, handleSubmit };
};

/* ===== EXPORTS ===== */
export default UpdatePopup;