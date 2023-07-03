/* ===== IMPORTS ===== */
import { useContext, useState } from "react";
import { useLocation } from "react-router-dom";
import { MessageContext, UserContext } from "../../Contexts";
import ReportUpdate from "../../database/update/ReportUpdates";
import ValidationHelper from "../../helper/ValidationHelper";

const ReportPopup = () => {
    /* ===== VARIABLES ===== */
    const formInit = { message: "", error: null, submitting: false };
    const location = useLocation();
	const path = location.pathname.split("/");
	const abb = path[2];
	const type = path[4];
	const levelName = path[5];

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
    // PRECONDITIONS (2 parameters):
    // 1.) submission: a submission object that contains information about the reported submission
    // 2.) setSubmission: function used to update the reportSubmission state in Levelboard.jsx. used to close popup if report
    // is successfully submitted
    // POSTCONDITIONS (3 possible outcomes):
    // if the message is not validated, the error field of form is updated by calling setForm() function, and the function returns early
    // if the message is validated, and at least one notification fails to insert, user is alerted of the error
    // if the message is validated, and all notifications insert, the user is alerted of the success, and the popup is closed
    const handleReport = async (submission, setSubmission) => {
        // first, update the form to prevent multiple submissions
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
            game_id: abb,
            level_id: levelName,
            score: type === "score" ? true : false,
            profile_id: submission.profile.id,
            creator_id: user.profile.id,
            message: form.message
        };
          
        // now, let's add the report to the database
        try {
            // await promises to complete
            await insertReport(report);
        
            // reload the page if the query is successful
            window.location.reload();
    
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

    // FUNCTION 3 - closePopup: given the setSubmission function, reset & close the popup
    // PRECONDITIONS (1 parameter):
    // 1.) setSubmission - function used to update the reportSubmission state in Levelboard.jsx. when set to null, the popup will close
    // POSTCONDITIONS (1 possible outcome):
    // the form is set to it's default value by calling setForm() with formInit argument, and the report popup is closed by calling 
    // setSubmission() with a null argument
    const closePopup = (setSubmission) => {
        setForm(formInit);
        setSubmission(null);
    };

    return { form, handleReport, handleChange, closePopup };
};

/* ===== EXPORTS ===== */
export default ReportPopup;