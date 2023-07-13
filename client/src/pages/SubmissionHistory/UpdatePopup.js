/* ===== IMPORTS ===== */
import { useLocation } from "react-router-dom";
import { useContext, useReducer } from "react";
import { GameContext, MessageContext, UserContext } from "../../utils/Contexts";
import AllSubmissionUpdate from "../../database/update/AllSubmissionUpdate";
import DateHelper from "../../helper/DateHelper";
import FrontendHelper from "../../helper/FrontendHelper";
import NotificationUpdate from "../../database/update/NotificationUpdate";
import ValidationHelper from "../../helper/ValidationHelper";

const UpdatePopup = () => {
    /* ===== VARIABLES ===== */
    const formInit = {
		values: null,
		error: { proof: null, comment: null, message: null },
        submitting: false
	};
    const location = useLocation();
    const path = location.pathname.split("/");
    const type = path[4];
    const levelId = path[5];

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
    const { getDateOfSubmission } = DateHelper();
    const { recordB2F, dateB2F } = FrontendHelper();
    const { validateMessage, validateProof, validateComment } = ValidationHelper();

    // FUNCTION 1: submission2Form ("submission to form")
    // PRECONDITIONS (4 parameters):
    // 1.) submission: a submission object, or undefined
    // 2.) type: a string, either "score" or "time"
    // 3.) levelName: a valid name of a level
    // 4.) profileId: a profile integer that belongs to some profile, or is null
    // POSTCONDITIONS (2 possible outcomes, 1 return):
    // if submission is defined, we use the information from this object to define the return object
    // if not, we set many of the form values to their default values
    // the object returned is compatible with the submission form
    const submission2Form = (submission, type, levelName, profileId) => {
        return {
            record: type === "time" ? recordB2F(submission.record, type) : submission.record,
            score: submission.score,
            monkey_id: submission.monkey.id,
            region_id: submission.region.id,
            live: submission.live,
            proof: submission.proof,
            comment: submission.comment ? submission.comment : "",
            profile_id: parseInt(profileId),
            game_id: game.abb,
            level_id: levelName,
            submitted_at: dateB2F(submission.submitted_at),
            message: ""
        };
    };

    // FUNCTION 2 - fillForm - function that is called when the popup activates
    // PRECONDITIONS (4 parameters):
    // 1.) submission: a submission object, which contains information about the current submission
    // 2.) profile: the profile object that is associated with the submission object
    // 3.) type: a string, either "score" or "time", which is defined in the URL
    // 4.) levelName: a valid level name string, which is defined in the URL
    // POSTCONDITIONS (1 possible outcome)
    // the submission is transformed into a format compatible with the form, and is updated by calling the dispatchForm() function
	const fillForm = (submission, profile, type, levelName) => {
		const formVals = submission2Form(submission, type, levelName, profile.id);
		dispatchForm({ field: "values", value: formVals });
	};

    // FUNCTION 3: isNotifyable - function that determines whether or not a submission should be sent a notification
    // PRECONDITIONS (2 parameters):
    // 1.) submission - the submission object in question
    // 2.) profile - a profile object, containing the profile info of the current submission
    // POSTCONDITIONS (2 possible outcomes):
    // if the submission belongs to the user, or is a "current" submission, return false
    // otherwise, return true
    const isNotifyable = (submission, profile) => {
        return parseInt(profile.id) !== user.profile.id && submission.submission.length !== 0;
    };

    // FUNCTION 4: handleChange - function that is called whenever the user makes any change to the form
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

    // FUNCTION 5: getUpdateFromForm - takes form data, and extracts only the updatable information
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

    // FUNCTION 6: handleNotification - determines if a submission needs a notification as well. if so, notification is inserted
    // to backend
    // PRECONDITIONS (3 parameters):
    // 1.) oldSubmission: a submission object containing information on the un-updated submission
    // 2.) profile: the profile object associated with the submission
    // 3.) message: a string representing the message created by the moderator to be sent in the notification
    // POSTCONDITION (2 possible outcomes):
    // if the submissions is "notifyable", this function will generate a notification object and make a call to 
    // insert it into the database
    // otherwise, this function returns early
    const handleNotification = async (oldSubmission, profile, message) => {
        // if these two ids are not equal, it means a moderator is updating a submission, so we need to notify the owner
        // of the submission of this action. if this condition is not met, the function will return early
        if (isNotifyable(oldSubmission, profile)) {
			const notification = {
				notif_type: "update",
				profile_id: profile.id,
				creator_id: user.profile.id,
				message: message,
                game_id: game.abb,
                level_id: levelId,
                score: type === "score",
                submission_id: oldSubmission.id,
                record: oldSubmission.record,
                submitted_at: oldSubmission.submitted_at,
                region_id: oldSubmission.region.id,
                monkey_id: oldSubmission.monkey.id,
                proof: oldSubmission.proof,
                live: oldSubmission.live,
                comment: oldSubmission.comment
			};
			
			// insert the notification into the database
			await insertNotification(notification);
		}
    };

    // FUNCTION 7: handleSubmit - function that is called when the user submits the form
    // PRECONDITIONS (3 parameters):
    // 1.) e: an event object which is generated when the user submits the update submission form
    // 2.) submission: a submission object, which represents the submission pre-update
    // 3.) profile: the profile object associated with the submission
    // POSTCONDITIONS (3 possible outcomes):
    // if the form fails to validate, the function will return early, and the user will be shown the errors
    // if the form successfully validates, but the data fails to submit, the submission process is halted, and the user is displayed an
    // error message
    // if the form successfully validates, and the data successfully submits, then the page is reloaded
    const handleSubmit = async (e, submission, profile) => {
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
		const id = submission.id;
		const updatedData = getUpdateFromForm(form.values, backendDate);

        try {
            // attempt to update the submission using updated data
            await updateSubmission(updatedData, id);

            // now, handle the notification
            await handleNotification(submission, profile, form.values.message);

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

    // FUNCTION 8: closePopup - function that is activated when the user attempts to close the popup
    // PRECONDITIONS (1 parameter):
    // 1.) setSubmission - function used to update the updateSubmission state in Levelboard.jsx. when set to null, the popup will close
    // POSTCONDITIONS (1 possible outcomes):
    // the form is set to default values by calling the dispatchForm() function with the { field: "all" } argument, and the popup
    // is set to false
    const closePopup = (setPopup) => {
        dispatchForm({ field: "all" });
        setPopup(null);
    };

    return { form, fillForm, handleChange, isNotifyable, handleSubmit, closePopup };
};

/* ===== EXPORTS ===== */
export default UpdatePopup;