/* ===== IMPORTS ===== */
import { MessageContext, ModeratorLayoutContext, UserContext } from "../../utils/Contexts";
import { useContext, useState } from "react";
import ApproveUpdate from "../../database/update/ApproveUpdate";
import DateHelper from "../../helper/DateHelper";
import FrontendHelper from "../../helper/FrontendHelper";
import NotificationUpdate from "../../database/update/NotificationUpdate";
import ReportDelete from "../../database/delete/ReportDelete";
import SubmissionDelete from "../../database/delete/SubmissionDelete";
import SubmissionUpdate from "../../database/update/SubmissionUpdate";
import ValidationHelper from "../../helper/ValidationHelper";

const SubmissionPopup = (submission, setSubmission, game, setSubmissions, isUnapproved) => {
    /* ===== VARIABLES ===== */
    const defaultForm = { 
        values: null, 
        error: {
            proof: null,
            comment: null,
            message: null
        }
    };

    /* ===== CONTEXTS ===== */

    // add message function from message context
    const { addMessage } = useContext(MessageContext);

    // dispatch games function from the moderator layout context
    const { dispatchGames } = useContext(ModeratorLayoutContext);

    // user state from user context
    const { user } = useContext(UserContext);

    /* ===== STATES ===== */
    const [form, setForm] = useState(defaultForm);
    const [showReject, setShowReject] = useState(false);
    const [clearToggle, setClearToggle] = useState(false);

    /* ===== FUNCTIONS ===== */
    
    // helper functions
    const { dateB2F } = FrontendHelper();
    const { validateProof, validateComment, validateMessage } = ValidationHelper();
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
        setForm({ ...form, values: {
            submitted_at: dateB2F(submission.submitted_at),
            region_id: submission.region.id.toString(),
            monkey_id: submission.monkey.id.toString(),
            platform_id: submission.platform.id.toString(),
            proof: submission.proof,
            live: submission.live,
            tas: submission.tas,
            comment: submission.comment,
            message: ""
        }});
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
            setForm({ ...form, values: { ...form.values, [id]: value } })
        }
    };

    // FUNCTION 3: handleToggle - code that executes each time the user toggles the "Clear Comment" option
    // PRECONDITIONS: NONE
    // POSTCONDITIONS (2 possible outcomes):
    // if the toggle is not activated before this function runs, the toggle will enable, and the comment will clear
    // if the toggle is activated before this function runs, the toggle will disable, and the comment will reappear
    const handleToggle = () => {
        setForm({ ...form, values: { ...form.values, comment: clearToggle ? submission.comment : "" } })
        setClearToggle(!clearToggle);
    };

    // FUNCTION 4: handleClose - function that runs to close the component
    // PRECONDITIONS: NONE
    // POSTCONDITIONS (1 possible outcome):
    // the form is set back to it's default values, and the popup is closed
    const handleClose = () => {
        setForm(defaultForm);
        setShowReject(false);
        setSubmission(null);
    };

    // FUNCTION 5: handleCloseAndRemove - function that removes the submission from both the `submissions` state, as well as 1 count
    // from the `games` state, and closes the popup
    // PRECONDITIONS: NONE
    // POSTCONDITIONS (1 possible outcome):
    // the submission is removed from both `submissions` state, as well as the count being updated in the `games` state, and the popup 
    // is closed
    const handleCloseAndRemove = () => {
        setSubmissions(submissions => submissions.filter(row => row !== submission));
        dispatchGames({ type: isUnapproved ? "decrementUnapproved" : "decrementReported", value: game.abb });
        handleClose(setSubmission);
    };

    // FUNCTION 6: isFormUnchanged - function that checks whether or not the form was unchanged
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

    // FUNCTION 7: approveSubmission - function that runs when the user approves a submission with NO changes to it
    // PRECONDITIONS: NONE
    // POSTCONDITIONS (2 possible outcomes):
    // if the submission approval is successful, we close the popup and render a success message to the user
    // if the submission approval is a failure, render an error message to the user
    const approveSubmission = async () => {
        try {
            const query = isUnapproved ? insertApproval(submission.id, user.profile.id) : deleteReport(submission.report.report_date);
            await query;
            handleCloseAndRemove();
            addMessage("Submission was successfully approved!", "success");
        } catch (error) {
            addMessage("There was a problem approving this submission.", "error");
        };
    };

    // FUNCTION 8: approveAndUpdateSubmission - function that runs when the user approves a submission with SOME changes to it
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
        error.proof = validateProof(form.values.proof);
        error.comment = validateComment(form.values.comment);
        error.message = validateMessage(form.values.message, false);

        // if any fields returned an error, let's render a message, update the `error.fields` object by calling the setForm() function,
        // and return early
        if (Object.values(error).some(row => row !== undefined)) {
            setForm({ ...form, error: error });
            addMessage("One or more form fields had errors.", "error");
            return;
        }

        try {
            // first, update submission with values from the form
            const { message, submitted_at, ...payload } = form.values;
            payload.submitted_at = getDateOfSubmission(form.values.submitted_at, submission.submitted_at);
            await updateSubmission(payload, submission.id);

            // next, insert approval
            const query = isUnapproved ? insertApproval(submission.id, user.profile.id) : deleteReport(submission.report.report_date);
            await query;

            // finally, close popup
            handleCloseAndRemove();
            addMessage("Submission was successfully updated and approved!", "success");

        } catch (error) {
            if (error.message === "approve") {
                addMessage("There was a problem approving this submission.", "error");
            } else {
                addMessage("There was a problem updating this submission.", "error");
            }
        };
    };

    // FUNCTION 9: onApproveClick - function that runs when the user hits the "approve" button
    // PRECONDITIONS (1 parameter):
    // 1.) e: an event object that is generated when the user submits the form
    // POSTCONDITIONS (2 possible outcomes):
    // if no changes to the form are detected, we run the `approveSubmission` function
    // otherwise, we run the `updateSubmission` function
    const onApproveClick = e => {
        e.preventDefault();
        if (isFormUnchanged()) {
            approveSubmission();
        } else {
            updateAndApproveSubmission();
        }
    };

    // FUNCTION 10: onRejectClick - function that runs when the user hits the "Yes, Reject" button
    // PRECONDITIONS (1 parameter):
    // 1.) e: an event object that is generated when the user submits the form
    // POSTCONDITIONS (2 possible outcomes):
    // if both queries succeed, we close the popup and render a success message to the user
    // if either query fails, render an error message to the user
    const onRejectClick = async e => {
        e.preventDefault();
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
            addMessage("Submission was successfully rejected!", "success");

        } catch (error) {
            if (error.message === "delete") {
                addMessage("There was a problem deleting this submission.", "error");
            } else {
                addMessage("The submission successfully was rejected, but the notification system failed to notify the user.", "error");
            }
        };
    };

    return { 
        form, 
        showReject, 
        clearToggle,
        setShowReject, 
        fillForm, 
        handleChange, 
        handleToggle,
        handleClose,
        onApproveClick,
        onRejectClick
    };
};

/* ===== EXPORTS ===== */
export default SubmissionPopup;