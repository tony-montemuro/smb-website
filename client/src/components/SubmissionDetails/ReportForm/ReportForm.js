/* ===== IMPORTS ===== */
import { useContext, useState } from "react";
import { PopupContext, MessageContext, UserContext } from "../../../utils/Contexts";
import ReportUpdate from "../../../database/update/ReportUpdate";

const ReportForm = () => {
    /* ===== VARIABLES ===== */
    const messageInit = "";

    /* ===== CONTEXTS ===== */

    // add message function from message context
    const { addMessage } = useContext(MessageContext);

    // close popup function from popup context
    const { closePopup } = useContext(PopupContext);

    // user state & updateUser function from user context
    const { user, updateUser } = useContext(UserContext);

    /* ===== STATES ===== */
    const [message, setMessage] = useState(messageInit);

    /* ===== FUNCTIONS ===== */

    // database functions
    const { insertReport } = ReportUpdate();

    // FUNCTION 1 - handleReport: given the report object, send an array of reports to all moderators, and the owner
    // of the submission
    // PRECONDITIONS (4 parameters):
    // 1.) e: an event object generated when the user submits the submission form
    // 2.) submission: a submission object that contains information about the reported submission
    // 3.) setSubmitting: a function that allows us to trigger the submitting state between true and false
    // 4.) updateBoard: a function that, when called, will update the "board" of the parent component
    // POSTCONDITIONS (2 possible outcomes):
    // if at least one query fails, user is alerted of the error, and the popup remains open
    // if all queries are successful, the popup will close, and the user will be notified that everything was a success
    const handleReport = async (e, submission, setSubmitting, updateBoards) => {
        // first, update the form to prevent multiple submissions
        e.preventDefault();
        setSubmitting(true);

        // define our report object
        const report = {
            submission_id: submission.id,
            creator_id: user.profile.id,
            message: message
        };

        // now, let's add the report to the database
        try {
            await insertReport(report);

            // now, make concurrent calls to both update user, as well as the boards of the caller component
            await Promise.all([updateUser(user.id), updateBoards()])
            await updateUser(user.id);
            addMessage("The submission was successfully reported! Please give the moderation team a few days to look it over.", "success", 10000);
            closePopup();

        } catch (error) {
            // otherwise, render an error message, and set the submitting state back to false
            addMessage("There was a problem reporting this submission.", "error", 8000);

        } finally {
            setSubmitting(false);
        }
    };

    // FUNCTION 2 - handleChange: given the event object, update the message state each time a user makes a change
    // PRECONDITIONS (1 parameter):
    // 1.) e: an event object generated when the user makes a change to the message form
    // POSTCONDITIONS (1 possible outcome):
    // the message state is updated by calling the setMessage() function to the current value of the form
    const handleChange = e => {
        setMessage(e.target.value);
    };

    return { message, handleReport, handleChange };
};

/* ===== EXPORTS ===== */
export default ReportForm;
