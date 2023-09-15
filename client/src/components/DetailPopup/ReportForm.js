/* ===== IMPORTS ===== */
import { useContext, useState } from "react";
import { MessageContext, UserContext } from "../../utils/Contexts";
import ReportUpdate from "../../database/update/ReportUpdate";
import ValidationHelper from "../../helper/ValidationHelper";

const ReportForm = () => {
    /* ===== VARIABLES ===== */
    const formInit = { message: "", error: null, submitting: false };

    /* ===== CONTEXTS ===== */

    // user state from user context
    const { user } = useContext(UserContext);

    // add message function from message context
    const { addMessage } = useContext(MessageContext);

    /* ===== STATES ===== */
    const [form, setForm] = useState(formInit);

    /* ===== FUNCTIONS ===== */

    // database functions
    const { insertReport } = ReportUpdate();

    // helper functions
    const { validateMessage } = ValidationHelper();

    // FUNCTION 1 - handleReport: given the report object, send an array of reports to all moderators, and the owner
    // of the submission
    // PRECONDITIONS (3 parameters):
    // 1.) e: an event object generated when the user submits the submission form
    // 2.) submission: a submission object that contains information about the reported submission
    // 3.) closeDetailPopup: a function called once we have reported the submission that will close the popup
    // POSTCONDITIONS (3 possible outcomes):
    // if the message is not validated, the error field of form is updated by calling setForm() function, and the function returns early
    // if the message is validated, and at least one notification fails to insert, user is alerted of the error
    // if the message is validated, and all notifications insert, the page will reload
    const handleReport = async (e, submission, closeDetailPopup) => {
        // first, update the form to prevent multiple submissions
        e.preventDefault();
        setForm({ ...form, submitting: true });

        // next, verify that the message is valid
        const error = validateMessage(form.message, true);
        if (error) {
            setForm({ ...form, error: error, submitting: false });
            addMessage(error, "error");
            return;
        }
    
        // define our report object
        const report = {
            submission_id: submission.id,
            creator_id: user.profile.id,
            message: form.message
        };
          
        // now, let's add the report to the database
        try {
            // await report to be completed
            await insertReport(report);
        
            // await popup to close
            await closeDetailPopup(true);

            // finally, let the user know that they successfully reported the submission
            addMessage("The submission was successfully reported! Please give the moderation team a few days to look it over.", "success");
    
        } catch (error) {
            // otherwise, render an error message, and set the submitting state back to false
            addMessage(error.message, "error");
            setForm({ ...form, submitting: false });
        }
    };

    // FUNCTION 2 - handleChange: given the event object, update the form state each time a user makes a change
    // PRECONDITIONS (1 parameter):
    // 1.) e: an event object generated when the user makes a change to the message form
    // POSTCONDITIONS (1 possible outcome):
    // the form state is updated by calling the setForm() function. the error field is set to null, and
    // the message field is set to the current value of the form
    const handleChange = (e) => {
        setForm({ error: null, message: e.target.value });
    };

    return { form, handleReport, handleChange };
};

/* ===== EXPORTS ===== */
export default ReportForm;