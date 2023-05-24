/* ===== IMPORTS ===== */
import { useContext, useState } from "react";
import { useLocation } from "react-router-dom";
import { MessageContext, UserContext } from "../../Contexts";
import AllSubmissionDelete from "../../database/delete/AllSubmissionDelete";
import NotificationUpdate from "../../database/update/NotificationUpdate";
import ValidationHelper from "../../helper/ValidationHelper";

const DeletePopup = () => {
    /* ===== VARIABLES ===== */
    const location = useLocation();
	const path = location.pathname.split("/");
	const abb = path[2];
	const type = path[4];
	const levelName = path[5];
    const formInit = { message: "", error: null };
    
    /* ===== CONTEXTS ===== */

    // user state from user context
    const { user } = useContext(UserContext);

    // add message function from the message context
    const { addMessage } = useContext(MessageContext);

    /* ===== STATES ===== */
    const [form, setForm] = useState(formInit);

    /* ===== FUNCTIONS ===== */

    // helper functions
    const { validateMessage } = ValidationHelper();

    // database functions
    const { deleteSubmission } = AllSubmissionDelete();
    const { insertNotification } = NotificationUpdate();

    // FUNCTION 1: handleOwnDelete - function that is called when a moderator deletes their own run
    // PRECONDITIONS (1 parameter, 1 condition):
    // 1.) submission_id: a string representing the id of the submission being deleted
    // this submission must belong to the current user
    // POSTCONDITIONS (2 possible outcomes):
    // if the submission is successfully removed from the database, the page is reloaded
    // otherwise, the user is alerted of the error that has occured, and the page is not reloaded
    const handleOwnDelete = async (submission_id) => {
        try {
            // await the removal of the submission
            await deleteSubmission(submission_id);

            // if successful, reload the page
            window.location.reload();

        } catch (error) {
            addMessage(error.message, "error");
        }
    };

    // FUNCTION 2: handleDelete - general function called when a moderator deletes a run (NOT belonging to themselves)
    // PRECONDITIONS (1 parameter, 1 condition):
    // 1.) submission: a submission object that contains information about the submission to be deleted
    // POSTCONDITIONS (3 possible outcomes):
    // if the message field in form is not validated, this function will update the error state in the setForm field by calling the
    // setForm() function, and return early
    // if the message field in form is validated, and the database queries are successful, the function will simply reload the page
    // if the message field in form is validated, but the database queries are unsuccessful, the user will be informed of the error
    // that caused the queries to fail, and the page is NOT reloaded
    const handleDelete = async (submission) => {
        // first, verify that the message is valid
        const error = validateMessage(form.message, false);

        // if there is an error, update the error field of the form state, and return the function early
        if (error) {
            setForm({ ...form, error: error });
            addMessage(error, "error");
            return;
        }

        // notification object
        const notification = { 
            notif_type: "delete",
            profile_id: submission.profile.id,
            creator_id: user.profile.id,
            message: form.message,
            game_id: abb,
            level_id: levelName,
            score: type === "score" ? true : false,
            record: submission.details.record
        };

        // perform database queries
        try {
            // first, remove the submission
            await deleteSubmission(submission.details.id);

            // then, insert the notification
            await insertNotification(notification);

            // if both queries succeed, reload the page
            window.location.reload();

        } catch (error) {
            if (error.code === "42501" && error.message === 'new row violates row-level security policy "Enforce receiving profile exists [RESTRICTIVE]" for table "notification"') {
                // special case: moderator attempted to update a submission for a profile who is unauthenticated. this is actually
                // expected behavior, so let's proceed as if there were not issues
                window.location.reload();
            } else {
                // general case: display error to user
                addMessage(error.message, "error");
            }
        }
    };
    
    // FUNCTION 3: handleChange - function that is called everytime the user updates the message form
    // PRECONDITIONS (1 parameter):
    // 1.) e: an event object generated when the user makes a change to the message form
    // POSTCONDITIONS (1 possible outcome):
    // the error and message fields of the form state are updated by calling the setForm() function. the error field is
    // set to null (default value), and the message field is set to the current value of the form field
    const handleChange = (e) => {
        setForm({ error: null, message: e.target.value });
    };

    // FUNCTION 4 - closePopup: given the setSubmission function, close the popup
    // PRECONDITIONS (1 parameter):
    // 1.) setBoard: the function that allows you to update the submission state, which will close the popup
    // POSTCONDITIONS (1 possible outcome):
    // the form is set to it's default value by calling setForm(formInit), and the delete popup is closed by calling
    // the setSubmission() function with a null value
    const closePopup = (setSubmission) => {
        setForm(formInit);
        setSubmission(null);
    };
    
    return { form, handleOwnDelete, handleDelete, handleChange, closePopup };
};

/* ===== EXPORTS ===== */
export default DeletePopup;