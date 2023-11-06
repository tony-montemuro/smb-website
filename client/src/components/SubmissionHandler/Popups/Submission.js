/* ===== IMPORTS ===== */
import { MessageContext, ModeratorLayoutContext, PopupContext, UserContext } from "../../../utils/Contexts";
import { useContext, useState } from "react";
import ApproveUpdate from "../../../database/update/ApproveUpdate";
import DateHelper from "../../../helper/DateHelper";
import FrontendHelper from "../../../helper/FrontendHelper";
import NotificationUpdate from "../../../database/update/NotificationUpdate";
import ReportDelete from "../../../database/delete/ReportDelete";
import SubmissionDelete from "../../../database/delete/SubmissionDelete";
import SubmissionUpdate from "../../../database/update/SubmissionUpdate";
import ValidationHelper from "../../../helper/ValidationHelper";

const Submission = (submission, game, isUnapproved, setSubmissions, setSubmitting) => {
    /* ===== VARIABLES ===== */
    const defaultError = { proof: null, submitted_at: null };
    const defaultForm = { 
        values: null, 
        error: defaultError
    };

    /* ===== CONTEXTS ===== */

    // add message function from message context
    const { addMessage } = useContext(MessageContext);

    // dispatch games function from the moderator layout context
    const { dispatchGames } = useContext(ModeratorLayoutContext);

    // close popup function from popup context
    const { closePopup } = useContext(PopupContext);

    // user state from user context
    const { user } = useContext(UserContext);

    /* ===== STATES ===== */
    const [form, setForm] = useState(defaultForm);
    const [showReject, setShowReject] = useState(false);
    const [clearToggle, setClearToggle] = useState(false);

    /* ===== FUNCTIONS ===== */
    
    // helper functions
    const { dateB2F } = FrontendHelper();
    const { validateVideoUrl, validateDate } = ValidationHelper();
    const { getDateOfSubmission } = DateHelper();

    // database functions
    const { insertApproval } = ApproveUpdate();
    const { insertNotification } = NotificationUpdate();
    const { deleteReport } = ReportDelete();
    const { deleteSubmission } = SubmissionDelete();
    const { updateSubmission } = SubmissionUpdate();

    // FUNCTION 1: fillForm - function that fills the form with values from the submission object
    // PRECONDITIONS: NONE
    // POSTCONDITIONS (1 possible outcome):
    // using data from the submission object, we fill the form values, and also set the clearForm value back to false
    const fillForm = () => {
        setForm({ 
            values: {
                submitted_at: dateB2F(submission.submitted_at),
                region_id: submission.region.id.toString(),
                monkey_id: submission.monkey.id.toString(),
                platform_id: submission.platform.id.toString(),
                proof: submission.proof,
                live: submission.live,
                tas: submission.tas,
                comment: submission.comment,
                message: ""
            },
            error: defaultError
        });
        setClearToggle(false);
    };

    // FUNCTION 2: handleChange - code that executes each time the user makes a change to the form
    // PRECONDITIONS (1 parameter):
    // 1.) e: an event object generated when the user makes a change to the form
    // POSTCONDITIONS (2 possible outcomes):
    // if the field id is live / tas, we use the checked variable rather than the value variable to update the form
	// otherwise, we simply update the form field based on the value variable
    const handleChange = e => {
        // get variables from e.target
        const { id, value, checked } = e.target;

        // special case: updating a checkbox field
        if (id === "live" || id === "tas") {
            setForm({ ...form, values: { ...form.values, [id]: checked } });
        }

        // general case: updating a field
        else {
            setForm({ 
                ...form, 
                values: { ...form.values, [id]: value }, 
                error: Object.keys(form.error).includes(id) ? { ...form.error, [id]: null } : { ...form.error } 
            });
        }
    };

    // FUNCTION 3: handleSubmittedAtChange - handle a change to the `submitted_at` field in the submission form
    // PRECONDITIONS (1 parameter):
    // 1.) e: an event object that is generated when the user makes a change to the `submitted_at` field of the submission form
    // POSTCONDITIONS (1 possible outcome):
    // the `submitted_at` field is updated using the date the user selected by the date picker
    const handleSubmittedAtChange = e => {
        let submitted_at = null;
        if (e) {
            let { $d: date } = e;
            const year = date.getFullYear();
            const month = String(date.getMonth()+1).padStart(2, "0");
            const day = String(date.getDate()).padStart(2, "0");
            submitted_at = `${ year }-${ month }-${ day }`;
        }
        setForm({ ...form, values: { ...form.values, submitted_at } });
    };

    // FUNCTION 4: handleToggle - code that executes each time the user toggles the "Clear Comment" option
    // PRECONDITIONS: NONE
    // POSTCONDITIONS (2 possible outcomes):
    // if the toggle is not activated before this function runs, the toggle will enable, and the comment will clear
    // if the toggle is activated before this function runs, the toggle will disable, and the comment will reappear
    const handleToggle = () => {
        setForm({ ...form, values: { ...form.values, comment: clearToggle ? submission.comment : "" } })
        setClearToggle(!clearToggle);
    };

    // FUNCTION 5: clearMessage - code to clear the message field
    // PRECONDITIONS: NONE
    // POSTCONDITIONS (1 possible outcome):
    // the message field is set to an empty string
    const clearMessage = () => {
        setForm({ ...form, values: { ...form.values, message: "" } });
    }

    // FUNCTION 6: handleClose - function that runs to close the component
    // PRECONDITIONS: NONE
    // POSTCONDITIONS (1 possible outcome):
    // the form is set back to it's default values, and the popup is closed
    const handleClose = () => {
        setForm(defaultForm);
        setShowReject(false);
        closePopup();
    };

    // FUNCTION 7: handleCloseAndRemove - function that removes the submission from both the `submissions` state, as well as 1 count
    // from the `games` state, and closes the popup
    // PRECONDITIONS: NONE
    // POSTCONDITIONS (1 possible outcome):
    // the submission is removed from both `submissions` state, as well as the count being updated in the `games` state, and the popup 
    // is closed
    const handleCloseAndRemove = () => {
        setSubmissions(submissions => submissions.filter(row => row !== submission));
        dispatchGames({ type: isUnapproved ? "decrementUnapproved" : "decrementReported", value: game.abb });
        handleClose();
    };

    // FUNCTION 8: isFormUnchanged - function that checks whether or not the form was unchanged
    // PRECONDITIONS: NONE
    // POSTCONDITIONS (2 possible outcomes):
    // if not a single form value is different than the value in submission, we return true
    // otherwise, return false
    const isFormUnchanged = () => {
        return form.values.submitted_at === dateB2F(submission.submitted_at)
            && form.values.region_id === submission.region.id.toString()
            && form.values.monkey_id === submission.monkey.id.toString()
            && form.values.platform_id === submission.platform.id.toString()
            && form.values.proof === submission.proof
            && form.values.live === submission.live
            && form.values.tas === submission.tas
            && form.values.comment === submission.comment;
    };

    // FUNCTION 9: approveSubmission - function that runs when the user approves a submission with NO changes to it
    // PRECONDITIONS: NONE
    // POSTCONDITIONS (2 possible outcomes):
    // if the submission approval is successful, we close the popup and render a success message to the user
    // if the submission approval is a failure, render an error message to the user
    const approveSubmission = async () => {
        try {
            const query = isUnapproved ? insertApproval(submission.id, user.profile.id) : deleteReport(submission.report.report_date);
            await query;
            handleCloseAndRemove();
            addMessage("Submission was successfully approved!", "success", 5000);
        } catch (error) {
            addMessage("There was a problem approving this submission.", "error", 7000);
        };
    };

    // FUNCTION 10: approveAndUpdateSubmission - function that runs when the user approves a submission with SOME changes to it
    // PRECONDITIONS: NONE
    // POSTCONDITIONS (2 possible outcomes):
    // if both queries succeed, we close the popup and render a success message to the user
    // if either query fails, render an error message to the user
    const updateAndApproveSubmission = async () => {
        // create an error object that will store error messages for each field value that needs to
        // be validated
        const error = {};
        Object.keys(form.error).forEach(field => error[field] = undefined);

        // validate necessary fields
        error.proof = validateVideoUrl(form.values.proof);
        error.submitted_at = validateDate(form.values.submitted_at);

        // if any fields returned an error, let's render a message, update the `error.fields` object by calling the setForm() function,
        // and return early
        if (Object.values(error).some(row => row !== undefined)) {
            setForm({ ...form, error: error });
            addMessage("One or more form fields had errors.", "error", 7000);
            return;
        }

        setSubmitting(true);
        try {
            // first, update submission with values from the form
            const { message, submitted_at, ...payload } = form.values;
            payload.submitted_at = getDateOfSubmission(form.values.submitted_at, submission.submitted_at);
            await updateSubmission(payload, submission.id);

            // next, insert approval
            const query = insertApproval(submission.id, user.profile.id);
            await query;

            // finally, close popup
            handleCloseAndRemove();
            addMessage("Submission was successfully updated and approved!", "success", 7000);

        } catch (error) {
            if (error.message === "approve") {
                addMessage("There was a problem approving this submission.", "error", 7000);
            } else {
                addMessage("There was a problem updating this submission.", "error", 7000);
            }
        } finally {
            setSubmitting(false);
        };
    };

    // FUNCTION 11: onApproveClick - function that runs when the user hits the "approve" button
    // PRECONDITIONS (1 parameter):
    // 1.) e: an event object that is generated when the user submits the form
    // POSTCONDITIONS (2 possible outcomes):
    // if no changes to the form are detected, we run the `approveSubmission` function
    // otherwise, we run the `updateSubmission` function
    const onApproveClick = e => {
        e.preventDefault();
        if (isFormUnchanged() || !isUnapproved) {
            approveSubmission();
        } else {
            updateAndApproveSubmission();
        }
    };

    // FUNCTION 12: onRejectClick - function that runs when the user hits the "Yes, Reject" button
    // PRECONDITIONS (1 parameter):
    // 1.) e: an event object that is generated when the user submits the form
    // POSTCONDITIONS (2 possible outcomes):
    // if both queries succeed, we close the popup and render a success message to the user
    // if either query fails, render an error message to the user
    const onRejectClick = async e => {
        e.preventDefault();
        setSubmitting(true);
        try {
            // first, attempt to delete the submission
            await deleteSubmission(submission.id);

            // next, we can attempt to notify the user of the deletion (this is only necessary if submission's profile id differs
            // from current user's id)
            if (user.profile.id !== submission.profile.id) {
                const notification = {
                    message: form.values.message,
                    game_id: game.abb,
                    level_id: submission.level.name,
                    category: submission.level.category,
                    score: submission.score,
                    record: submission.record,
                    profile_id: submission.profile.id,
                    creator_id: user.profile.id,
                    notif_type: "delete",
                    tas: submission.tas
                };
                await insertNotification(notification);
            }

            // finally, close popup
            handleCloseAndRemove();
            addMessage("Submission was successfully rejected!", "success", 5000);

        } catch (error) {
            if (error.message === "delete") {
                addMessage("There was a problem deleting this submission.", "error", 7000);
            } else {
                addMessage("The submission successfully was rejected, but the notification system failed to notify the user.", "error", 10000);
            }
        } finally {
            setSubmitting(false);
        };
    };

    return { 
        form, 
        showReject, 
        setShowReject, 
        fillForm, 
        handleChange, 
        handleSubmittedAtChange,
        handleToggle,
        clearMessage,
        handleClose,
        isFormUnchanged,
        onApproveClick,
        onRejectClick
    };
};

/* ===== EXPORTS ===== */
export default Submission;