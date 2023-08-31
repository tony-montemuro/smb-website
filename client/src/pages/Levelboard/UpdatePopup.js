/* ===== IMPORTS ===== */
import { MessageContext } from "../../utils/Contexts";
import { useContext, useReducer } from "react";
import { useLocation } from "react-router-dom";
import AllSubmissionUpdate from "../../database/update/AllSubmissionUpdate";
import DateHelper from "../../helper/DateHelper";
import LevelboardUtils from "./LevelboardUtils";
import Submission2Update from "../../database/update/Submission2Update";
import ValidationHelper from "../../helper/ValidationHelper";

const UpdatePopup = () => {
    /* ===== VARIABLES ===== */
    const location = useLocation();
    const path = location.pathname.split("/");
    const category = path[3];
    const type = path[4];
    const levelName = path[5];
    const formInit = {
		values: null,
		error: { proof: null, comment: null },
        submitting: false
	};

    /* ===== CONTEXTS ===== */

    // add message function from message context
    const { addMessage } = useContext(MessageContext);

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
            case "all":
                return formInit;
			default:
				return { ...state, [action.field]: action.value };
		}
	}, formInit);

    /* ===== FUNCTIONS ===== */

    // database functions
    const { updateSubmission } = AllSubmissionUpdate(); 
    const { updateSubmission2 } = Submission2Update();

    // helper functions
    const { getDateOfSubmission } = DateHelper();
    const { submission2Form } = LevelboardUtils();
    const { validateProof, validateComment } = ValidationHelper();

    // FUNCTION 1 - fillForm - function that is called when the popup activates
    // PRECONDITIONS (1 parameter):
    // 1.) submissions: an array of all submission objects belonging to the current user for the current level
    // POSTCONDITIONS (1 possible outcome)
    // the submission is transformed into a format compatible with the form, and is updated by calling the dispatchForm() function
	const fillForm = (submissions, type, levelName, category) => {
        const submission = submissions[0];
		const formVals = submission2Form(submission, type, levelName, category, submission.profile.id);
		dispatchForm({ field: "values", value: formVals });
	};

    // FUNCTION 2: handleChange - function that is called whenever the user makes any change to the form
    // PRECONDITIONS (2 parameters):
	// 1.) e: an event object generated when the user makes a change to the form
    // 2.) submissions: an array of all submission objects belonging to the current user for the current level. this parameter
    // is only necessary if we are modifying the `id` field
	// POSTCONDITIONS (2 possible outcomes):
	// if the field id is live, we use the checked variable rather than the value variable to update the form
	// otherwise, we simply update the form field based on the value variable
	const handleChange = (e, submissions) => {
        // descruct properties of e.target used in this function
        const { id, value, checked } = e.target;

		switch (id) {
			// case 1: live. this is a checkbox, so we need to use the "checked" variable as our value
			case "live":
				dispatchForm({ field: "values", value: { live: checked } });
				break;

            // case 2: tas: this is a checkbox, so we also need to use the "checked" variable as our value
            case "tas":
                dispatchForm({ field: "values", value: { tas: checked } });
                break;

            // case 3: id. this field will update the entire form, so we do that here
            case "id":
                const submission = submissions.find(submission => submission.id === value);
                const formVals = submission2Form(submission, type, levelName, category, submission.profile.id);
                dispatchForm({ field: "values", value: formVals });
                break;

			// default case: simply update the id field of the values object with the value variable
			default:
				dispatchForm({ field: "values", value: { [id]: value } });
		};
    };

    // FUNCTION 3: getUpdateFromForm - takes form data, and extracts only the updatable information
    // PRECONDITIONS (4 parameters):
    // 1.) formVals: an object that stores the updated submission form values
    // 2.) date: a string representing the backend date of a submission
    // POSTCONDITIONS (1 possible outcome):
    // unnecessary form data is shaved off, returning only the attributes that are "updatable" according to the db
    // the date parameter is also used to determine the "submitted_at" field
    const getUpdateFromForm = (formVals, date) => {
        // create our new updatedData object, which is equivelent to formVals minus the following fields:
        // id, game_id, level_id, score, record, position, all_position, profile_id, approved
        const { 
            id,
            game_id,
            level_id,
            category,
            score,
            record,
            position,
            all_position,
            profile_id,
            approved,
            ...updatedData 
        } = formVals;

        // add additional fields to submission object
        updatedData.submitted_at = date;

        return updatedData;
    };

    // FUNCTION 4: handleSubmit - function that is called when the user submits the form
    // PRECONDITIONS (2 parameters):
    // 1.) e: an event object which is generated when the user submits the update submission form
    // 2.) submissions: an array of all submission objects belonging to the current user for the current level
    // POSTCONDITIONS (3 possible outcomes):
    // if the form fails to validate, the function will return early, and the user will be shown the errors
    // if the form successfully validates, but the data fails to submit, the submission process is halted, and the user is displayed an
    // error message
    // if the form successfully validates, and the data successfully submits, then the page is reloaded
    const handleSubmit = async (e, submissions) => {
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
            addMessage("One or more form fields had errors.", "error");
            return;
        }

        // finally, let's convert the date from the front-end format, to the backend format.
        const submission = submissions.find(submission => submission.id === form.values.id);
		const backendDate = getDateOfSubmission(form.values.submitted_at, submission.submitted_at);

        // if we made it this far, no errors were detected, generate our submission data
		const id = submission.id;
		const updatedData = getUpdateFromForm(form.values, backendDate);

        try {
            // attempt to update the submission using updated data
            await updateSubmission2(updatedData, id);

            // reload the page
            window.location.reload();

        } catch (error) {
            addMessage(error.message, "error");
            dispatchForm({ field: "submitting", value: false });
        };
    };

    // FUNCTION 6: closePopup - function that is activated when the user attempts to close the popup
    // PRECONDITIONS (1 parameter):
    // 1.) setSubmission - function used to update the updateSubmission state in Levelboard.jsx. when set to null, the popup will close
    // POSTCONDITIONS (1 possible outcomes):
    // the form is set to default values by calling the dispatchForm() function with the { field: "all" } argument, and the popup
    // is set to false
    const closePopup = (setPopup) => {
        dispatchForm({ field: "all" });
        setPopup(null);
    };

    return { form, fillForm, handleChange, handleSubmit, closePopup };
};

/* ===== EXPORTS ===== */
export default UpdatePopup;