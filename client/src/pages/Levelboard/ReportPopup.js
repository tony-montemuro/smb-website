/* ===== IMPORTS ===== */
import { useContext, useState } from "react";
import { StaticCacheContext, UserContext } from "../../Contexts";
import NotificationUpdate from "../../database/update/NotificationUpdate";
import ValidationHelper from "../../helper/ValidationHelper";

const DeletePopup = () => {
    /* ===== VARIABLES ===== */
    const formInit = { message: "", error: null };

    /* ===== CONTEXTS ===== */

    // static cache state from static cache context
    const { staticCache } = useContext(StaticCacheContext);

    // user state from user context
    const { user } = useContext(UserContext);

    /* ===== STATES ===== */
    const [form, setForm] = useState(formInit);
    const [reportMessage, setReportMessage] = useState(null);

    /* ===== FUNCTIONS ===== */

    // helper functions
    const { validateMessage } = ValidationHelper();
    const { insertNotification } = NotificationUpdate();

    // FUNCTION 1 - handleReport: given the report object, send an array of reports to all moderators, and the owner
    // of the submission
    // PRECONDITIONS (1 parameter):
    // 1.) report: an object that contains information about the reported submission. comes from the board state in Levelboard.js.
    // POSTCONDITIONS (3 possible outcomes):
    // if the message is not validated, the error field of form is updated by calling setForm() function, and the function returns early
    // if the message is validated, and at least one notification fails to insert, user is alerted of the error
    // if the message is validated, and all notifications insert, reportMessage is updated by calling the setReportMessage function
    const handleReport = async (report) => {
        // first, verify that the message is valid
        const error = validateMessage(form.message, true);
        if (error) {
            setForm({ ...form, error: error });
            return;
        }
    
        // now, let's get the list of mods that DOES NOT include the current user if they are a moderator
        const moderators = staticCache.moderators;
        const relevantMods = moderators.filter(row => row.profile_id !== user.profile.id);
    
        // define our base notifObject
        const notifObject = {
            notif_type: "report",
            creator_id: user.profile.id,
            game_id: report.game_id,
            level_id: report.level_id,
            score: report.type === "score" ? true : false,
            record: report.record,
            submission_id: report.id,
            message: form.message
        };

        // create an array of functions, each of which corresponds to a function call to inserting a notification to the database
        // this is for moderators
        const notifPromises = relevantMods.map(e => {
            return insertNotification({ ...notifObject, profile_id: e.profile_id });
        });

        // finally, push the function that inserts a notification to the database for the user being reported
        notifPromises.push(
            insertNotification({ ...notifObject, profile_id: report.profile_id })
        );
          
        // now, let's actually perform all the queries
        try {
            // await promises to complete
            await Promise.all(notifPromises);
        
            // finally, set the report message. this will show to the user to let them know the report was a success
            setReportMessage(`Report was successful. All moderators, as well as ${ report.username }, have been notified.`);
    
        } catch (error) {
            console.log(error);
            alert(error.message);
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

    // FUNCTION 3 - closePopup: given the board state, and it's corresponding function (setBoard), close the popup
    // PRECONDITIONS (2 parameters):
    // 1.) board: the board state, which is defined in Levelboard.js
    // 2.) setBoard: the function that allows you to update the board state
    // POSTCONDITIONS (1 possible outcome):
    // the form is set to it's default value by calling setForm(formInit), setReportMessage is set to it's default value
    // by calling setReportMessage(null), and the report popup is closed by calling setBoard({ ...board, report: null })
    const closePopup = (board, setBoard) => {
        setForm(formInit);
        setReportMessage(null);
        setBoard({ ...board, report: null });
    };

    return { form, reportMessage, handleReport, handleChange, closePopup };
};

/* ===== EXPORTS ===== */
export default DeletePopup;