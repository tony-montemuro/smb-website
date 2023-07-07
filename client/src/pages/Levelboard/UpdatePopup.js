/* ===== IMPORTS ===== */
import { useContext, useReducer } from "react";
import { GameContext, MessageContext, UserContext } from "../../utils/Contexts";
import AllSubmissionUpdate from "../../database/update/AllSubmissionUpdate";
import LevelboardUtils from "./LevelboardUtils";
import NotificationUpdate from "../../database/update/NotificationUpdate";
import ValidationHelper from "../../helper/ValidationHelper";

const UpdatePopup = () => {
    /* ===== VARIABLES ===== */
    const formInit = {
		values: null,
		error: { proof: null, comment: null, message: null },
        submitting: false
	};

    /* ===== CONTEXTS ===== */

    // game state from game context
    const { game } = useContext(GameContext);

    // user state from user context
    const { user } = useContext(UserContext);

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
    const { insertNotification } = NotificationUpdate();

    // helper functions
    const { 
        submission2Form, 
        validateComment, 
        validateProof, 
        getDateOfSubmission
    } = LevelboardUtils();
    const { validateMessage } = ValidationHelper();

    // FUNCTION 1 - fillForm - function that is called when the popup activates
    // PRECONDITIONS (3 parameters):
    // 1.) submission: a submission object, which contains information about the current submission
    // 2.) type: a string, either "score" or "time", which is defined in the URL
    // 3.) levelName: a valid level name string, which is defined in the URL
    // POSTCONDITIONS (1 possible outcome)
    // the submission is transformed into a format compatible with the form, and is updated by calling the dispatchForm() function
	const fillForm = (submission, type, levelName) => {
		const formVals = submission2Form(submission, type, levelName, submission.profile.id);
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

    // FUNCTION 3: getUpdateFromForm - takes form data, and extracts only the updatable information
    // PRECONDITIONS (4 parameters):
    // 1.) formVals: an object that stores the updated submission form values
    // 2.) date: a string representing the backend date of a submission
    // POSTCONDITIONS (1 possible outcome):
    // unnecessary form data is shaved off, returning only the attributes that are "updatable" according to the db
    // the date parameter is also used to determine the "submitted_at" field
    const getUpdateFromForm = (formVals, date) => {
        // create our new updatedData object, which is equivelent to formVals minus the following fields:
        // id, game_id, level_id, score, record, position, all_position, profile_id, message
        const { 
            id,
            game_id,
            level_id,
            score,
            record,
            position,
            all_position,
            profile_id,
            message,
            ...updatedData 
        } = formVals;

        // add additional fields to submission object
        updatedData.submitted_at = date;

        return updatedData;
    };

    // FUNCTION 4: handleNotification - determines if a submission needs a notification as well. if so, notification is inserted
    // to backend
    // PRECONDITIONS (2 parameters):
    // 1.) oldSubmission: a submission object containing information on the un-updated submission
    // 2.) message: a string representing the message created by the moderator to be sent in the notification
    // POSTCONDITION (2 possible outcomes):
    // if the current user does not own the submission, this function will generate a notification object and make a call to 
    // insert it into the database
    // if the current user does own the submission, this function returns early
    const handleNotification = async (oldSubmission, message) => {
        // initialize variables
        const submissionProfileId = oldSubmission.profile.id;
        const submissionDetails = oldSubmission.details;

        // if these two ids are not equal, it means a moderator is updating a submission, so we need to notify the owner
        // of the submission of this action. if this condition is not met, the function will return early
        if (user.profile.id !== submissionProfileId) {
			const notification = {
				notif_type: "update",
				profile_id: submissionProfileId,
				creator_id: user.profile.id,
				message: message,
                game_id: game.abb,
                level_id: oldSubmission.level.name,
                score: oldSubmission.score,
                submission_id: submissionDetails.id,
                record: submissionDetails.record,
                submitted_at: submissionDetails.submitted_at,
                region_id: submissionDetails.region.id,
                monkey_id: submissionDetails.monkey.id,
                proof: submissionDetails.proof,
                live: submissionDetails.live,
                comment: submissionDetails.comment
			};
			
			// insert the notification into the database
			await insertNotification(notification);
		}
    };

    // FUNCTION 5: handleSubmit - function that is called when the user submits the form
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
        error.message = validateMessage(form.values.message, false);

        // if any errors are determined, let's return
        dispatchForm({ field: "error", value: error });
		if (Object.values(error).some(row => row !== undefined)) {
            dispatchForm({ field: "submitting", value: false });
            addMessage("One or more form fields had errors.", "error");
            return;
        }

        // finally, let's convert the date from the front-end format, to the backend format.
		const backendDate = getDateOfSubmission(form.values.submitted_at, submission);

        // if we made it this far, no errors were detected, generate our submission data
		const id = submission.details.id;
		const updatedData = getUpdateFromForm(form.values, backendDate);

        try {
            // attempt to update the submission using updated data
            await updateSubmission(updatedData, id);

            // now, handle the notification
            await handleNotification(submission, form.values.message);

            // reload the page
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