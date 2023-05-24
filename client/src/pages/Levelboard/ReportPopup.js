/* ===== IMPORTS ===== */
import { useContext, useState } from "react";
import { useLocation } from "react-router-dom";
import { MessageContext, StaticCacheContext, UserContext } from "../../Contexts";
import NotificationUpdate from "../../database/update/NotificationUpdate";
import ValidationHelper from "../../helper/ValidationHelper";

const ReportPopup = () => {
    /* ===== VARIABLES ===== */
    const formInit = { message: "", error: null, submitting: false, submitted: false };
    const location = useLocation();
	const path = location.pathname.split("/");
	const abb = path[2];
	const type = path[4];
	const levelName = path[5];

    /* ===== CONTEXTS ===== */

    // static cache state from static cache context
    const { staticCache } = useContext(StaticCacheContext);

    // user state from user context
    const { user } = useContext(UserContext);

    // add message function from message context
    const { addMessage } = useContext(MessageContext);

    /* ===== STATES ===== */
    const [form, setForm] = useState(formInit);

    /* ===== FUNCTIONS ===== */

    // helper functions
    const { validateMessage } = ValidationHelper();
    const { insertNotification } = NotificationUpdate();

    // FUNCTION 1 - handleReport: given the report object, send an array of reports to all moderators, and the owner
    // of the submission
    // PRECONDITIONS (1 parameter):
    // 1.) submission: a submission object that contains information about the reported submission
    // POSTCONDITIONS (3 possible outcomes):
    // if the message is not validated, the error field of form is updated by calling setForm() function, and the function returns early
    // if the message is validated, and at least one notification fails to insert, user is alerted of the error
    // if the message is validated, and all notifications insert, reportMessage is updated by calling the setReportMessage function
    const handleReport = async (submission) => {
        // first, update the form to prevent multiple submissions
        setForm({ ...form, submitting: true });

        // next, verify that the message is valid
        const error = validateMessage(form.message, true);
        if (error) {
            setForm({ ...form, error: error, submitting: false });
            addMessage(error, "error");
            return;
        }
    
        // now, let's get the list of mods that DOES NOT include the current user if they are a moderator
        const moderators = staticCache.moderators;
        const relevantMods = moderators.filter(row => row.profile_id !== user.profile.id && row.profile_id !== submission.profile.id);
    
        // define our base notifObject
        const notifObject = {
            notif_type: "report",
            creator_id: user.profile.id,
            game_id: abb,
            level_id: levelName,
            score: type === "score" ? true : false,
            record: submission.details.record,
            submission_id: submission.details.id,
            message: form.message
        };

        // create an array of functions, each of which corresponds to a function call to inserting a notification to the database
        // this is for moderators
        const notifPromises = relevantMods.map(e => {
            return insertNotification({ ...notifObject, profile_id: e.profile_id });
        });

        // finally, push the function that inserts a notification to the database for the user being reported
        notifPromises.push(
            insertNotification({ ...notifObject, profile_id: submission.profile.id })
        );
          
        // now, let's actually perform all the queries
        try {
            // await promises to complete
            await Promise.all(notifPromises);
        
            // finally, update form submitting & submitted fields. this will ensure the form does not allow resubmits, and render a success
            // message to the user
            setForm({ ...form, submitting: false, submitted: true });
            addMessage("Report successfully submitted.", "success");
    
        } catch (error) {
            addMessage(error.message, "error");
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