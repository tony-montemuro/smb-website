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
        getDateOfSubmission, 
        getSubmissionFromForm
    } = LevelboardUtils();

    // FUNCTION 1 - fillForm - function that is called when the popup activates
	const fillForm = (submission, type, levelName, profileId) => {
		const formVals = submission2Form(submission, type, levelName, profileId);
		dispatchForm({ field: "values", value: formVals });
	};

    // FUNCTION 2: handleChange - function that is called whenever the user makes any change to the form
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

    // FUNCTION 3: handleSubmit - function that is called when the user submits the form
    const handleSubmit = async (e, submission, submissions) => {
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
		const updatedSubmission = getSubmissionFromForm(form.values, backendDate, id, submissions);

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