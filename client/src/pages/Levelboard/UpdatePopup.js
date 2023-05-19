/* ===== IMPORTS ===== */
import { useContext, useReducer } from "react";
import { UserContext } from "../../Contexts";
import AllSubmissionUpdate from "../../database/update/AllSubmissionUpdate";
import LevelboardUtils from "./LevelboardUtils";
import NotificationUpdate from "../../database/update/NotificationUpdate";

const UpdatePopup = () => {
    /* ===== VARIABLES ===== */
    const updateFormInit = {
		values: null,
		error: { proof: null, comment: null },
        submitting: false
	};

    /* ===== CONTEXTS ===== */

    // user state from user context
    const { user } = useContext(UserContext);

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
    const { insertNotification } = NotificationUpdate();

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
        submission.all_position = oldSubmission.details.all_position;
		submission.position = oldSubmission.details.position;

        return submission;
    };

    // FUNCTION 4: handleNotification - determines if a submission needs a notification as well. if so, notification is inserted
    // to backend
    // PRECONDITIONS (2 parameters):
    // 1.) formVals: an object that contains data from the submission form
    // 2.) oldSubmission: a submission object containing information on the un-updated submission
    // 3.) id: a string representing the unique id assigned to the current submission
    // POSTCONDITION (2 possible outcomes):
    // if the current user does not own the submission, this function will generate a notification object and make a call to 
    // insert it into the database
    // if the current user does own the submission, this function returns early
    const handleNotification = async (formVals, oldSubmission, id) => {
        // initialize variables
        const submissionProfileId = formVals.profile_id;
        const submissionDetails = oldSubmission.details;

        // if these two ids are not equal, it means a moderator is updating a submission, so we need to notify the owner
        // of the submission of this action. if this condition is not met, the function will return early
        if (user.profile.id !== submissionProfileId) {
			const notification = {
				notif_type: "update",
				profile_id: submissionProfileId,
				creator_id: user.profile.id,
				message: formVals.message,
                game_id: formVals.game_id,
                level_id: formVals.level_id,
                score: formVals.score,
                record: formVals.record,
				submission_id: id,
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

            // now, handle the notification
            await handleNotification(form.values, submission, id);

            // reload the page
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
                
            }

            
        };
    };

    return { form, fillForm, handleChange, handleSubmit };
};

/* ===== EXPORTS ===== */
export default UpdatePopup;