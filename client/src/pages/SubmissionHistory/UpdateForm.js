/* ===== IMPORTS ===== */
import { useContext, useReducer, useState } from "react";
import { GameContext, MessageContext } from "../../utils/Contexts";
import AllSubmissionUpdate from "../../database/update/AllSubmissionUpdate";
import DateHelper from "../../helper/DateHelper";
import FrontendHelper from "../../helper/FrontendHelper";
import ValidationHelper from "../../helper/ValidationHelper";

const UpdateForm = () => {
    /* ===== VARIABLES ===== */
    const formInit = {
		values: null,
		error: { proof: null, comment: null },
        submitting: false
	};

    /* ===== CONTEXTS ===== */

    // game state from game context
    const { game } = useContext(GameContext);

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
    const [clearToggle, setClearToggle] = useState(false);

    /* ===== FUNCTIONS ===== */

    // database functions
    const { updateSubmission } = AllSubmissionUpdate(); 

    // helper functions
    const { getDateOfSubmission } = DateHelper();
    const { recordB2F, dateB2F } = FrontendHelper();
    const { validateProof, validateComment } = ValidationHelper();

    // FUNCTION 1: submission2Form ("submission to form")
    // PRECONDITIONS (5 parameters):
    // 1.) submission: a submission object, or undefined
    // 2.) type: a string, either "score" or "time"
    // 3.) levelName: a valid name of a level
    // 4.) category: a string representing a valid category
    // 5.) profileId: a profile integer that belongs to some profile, or is null
    // POSTCONDITIONS (2 possible outcomes, 1 return):
    // if submission is defined, we use the information from this object to define the return object
    // if not, we set many of the form values to their default values
    // the object returned is compatible with the submission form
    const submission2Form = (submission, type, levelName, category, profileId) => {
        return {
            record: type === recordB2F(submission.record, type, submission.level.timer_type),
            score: submission.score,
            monkey_id: submission.monkey.id,
            region_id: submission.region.id,
            live: submission.live,
            proof: submission.proof,
            comment: submission.comment ? submission.comment : "",
            profile_id: parseInt(profileId),
            game_id: game.abb,
            level_id: levelName,
            category: category,
            submitted_at: dateB2F(submission.submitted_at),
        };
    };

    // FUNCTION 2 - fillForm - function that is called when the popup activates
    // PRECONDITIONS (5 parameters):
    // 1.) submission: a submission object, which contains information about the current submission
    // 2.) profile: the profile object that is associated with the submission object
    // 3.) type: a string, either "score" or "time", which is defined in the URL
    // 4.) levelName: a valid level name string, which is defined in the URL
    // 5.) category: a string representing a valid category
    // POSTCONDITIONS (1 possible outcome)
    // the submission is transformed into a format compatible with the form, and is updated by calling the dispatchForm() function
	const fillForm = (submission, profile, type, levelName, category) => {
		const formVals = submission2Form(submission, type, levelName, category, profile.id);
		dispatchForm({ field: "values", value: formVals });
	};

    // FUNCTION 3: handleChange - function that is called whenever the user makes any change to the form
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

    // FUNCTION 4: handleToggle - code that executes each time the user toggles the "Clear Comment" option
    // PRECONDITIONS (1 parameter):
    // 1.) submission: a submission object
    // POSTCONDITIONS (2 possible outcomes):
    // if the toggle is not activated before this function runs, the toggle will enable, and the comment will clear
    // if the toggle is activated before this function runs, the toggle will disable, and the comment will reappear
    const handleToggle = submission => {
        dispatchForm({ field: "values", value: { comment: clearToggle ? submission.comment : "" } });
        setClearToggle(!clearToggle);
    };

    // FUNCTION 5: getUpdateFromForm - takes form data, and extracts only the updatable information
    // PRECONDITIONS (4 parameters):
    // 1.) formVals: an object that stores the updated submission form values
    // 2.) date: a string representing the backend date of a submission
    // POSTCONDITIONS (1 possible outcome):
    // unnecessary form data is shaved off, returning only the attributes that are "updatable" according to the db
    // the date parameter is also used to determine the "submitted_at" field
    const getUpdateFromForm = (formVals, date) => {
        // create our new updatedData object, which is equivelent to formVals minus the following fields:
        // id, game_id, level_id, category, score, record, position, all_position, profile_id
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
            ...updatedData 
        } = formVals;

        // add additional fields to submission object
        updatedData.submitted_at = date;

        return updatedData;
    };

    // FUNCTION 6: handleSubmit - function that is called when the user submits the form
    // PRECONDITIONS (2 parameters):
    // 1.) e: an event object which is generated when the user submits the update submission form
    // 2.) submission: a submission object, which represents the submission pre-update
    // POSTCONDITIONS (3 possible outcomes):
    // if the form fails to validate, the function will return early, and the user will be shown the errors
    // if the form successfully validates, but the data fails to submit, the submission process is halted, and the user is displayed an
    // error message
    // if the form successfully validates, and the data successfully submits, then the page is reloaded
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
            addMessage("One or more form fields had errors.", "error");
            return;
        }

        // finally, let's convert the date from the front-end format, to the backend format.
		const backendDate = getDateOfSubmission(form.values.submitted_at, submission.submitted_at);

        // if we made it this far, no errors were detected, generate our submission data
		const id = submission.id;
		const updatedData = getUpdateFromForm(form.values, backendDate);

        try {
            // attempt to update the submission using updated data
            await updateSubmission(updatedData, id);

            // reload the page
            window.location.reload();

        } catch (error) {
            addMessage(error.message, "error");
            dispatchForm({ field: "submitting", value: false });
        };
    };

    return { form, clearToggle, fillForm, handleChange, handleToggle, handleSubmit };
};

/* ===== EXPORTS ===== */
export default UpdateForm;