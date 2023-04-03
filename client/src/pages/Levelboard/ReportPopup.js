/* ===== IMPORTS ===== */
import "./Levelboard.css";
import { useContext, useState } from "react";
import { UserContext } from "../../Contexts";
import LevelboardHelper from "../../helper/LevelboardHelper";
import LevelboardUpdate from "../../database/update/LevelboardUpdate";

function ReportPopup({ board, setBoard, moderators }) {
    /* ===== VARIABLES ===== */
    const formInit = { message: "", error: null };

    /* ===== CONTEXTS ===== */

    // user state from user context
    const { user } = useContext(UserContext);

    /* ===== STATES ===== */
    const [form, setForm] = useState(formInit);
    const [reportMessage, setReportMessage] = useState(null);

    /* ===== FUNCTIONS ===== */

    // helper functions
    const { validateMessage } = LevelboardHelper();
    const { insertNotification } = LevelboardUpdate();

    // function that is used to send reports to each mod, as well as the owner of the submission being reported
    const handleReport = async () => {
        // first, verify that the message is valid
        const error = validateMessage(form.message, true);
        if (error) {
            setForm({ ...form, error: error });
            return;
        }

        // now, let's get the list of mods that DOES NOT include the current user if they are a moderator
        const relevantMods = moderators.filter(row => row.user_id !== user.id);

        // now, let's send the report notification to { board.report.username }, as well as all the moderators
        const notifPromises = relevantMods.map(e => {
            return insertNotification({
                notif_type: "report",
                user_id: e.user_id, 
                creator_id: user.id,
                level_id: board.report.level_id,
                score: board.report.type === "score" ? true : false,
                record: board.report.record,
                submission_id: board.report.id,
                message: form.message
            });
        });
        notifPromises.push(
            insertNotification({
                notif_type: "report",
                user_id: board.report.user_id, 
                creator_id: user.id,
                level_id: board.report.level_id,
                score: board.report.type === "score" ? true : false,
                record: board.report.record,
                submission_id: board.report.id,
                message: form.message
            })
        );
        
        try {
            // await promises to complete
            await Promise.all(notifPromises);

            // finally, set the report message. this will show to the user to let them know the report was a success
            setReportMessage(`Report was successful. All moderators, as well as ${ board.report.username }, have been notified.`);

        } catch (error) {
            console.log(error);
            alert(error.message);
        }
    };

    // function that resets the internal state of the component when the component is closed
    const closePopup = () => {
        setForm(formInit);
        setReportMessage(null);
        setBoard({ ...board, report: null });
    };

    /* ===== REPORT POPUP COMPONENT ===== */
    return (
        board.report ?
            <div className="levelboard-popup">
                <div className="levelboard-popup-inner">
                    <div className="report-levelboard-popup">
                        <button onClick={ closePopup }>Close</button>
                    </div>
                    <h2>Are you sure you want to report the following { board.report.type }: { board.report.record } by { board.report.username }?</h2>
                    <p>In your message, please explain your reasoning for reporting the submission. This message will be delivered to { board.report.username },
                    as well as the moderation team.</p>
                    <p><b>Note:</b> <i>Please only report once! Repeatedly reporting a single submission can result in a permanent account ban!</i></p>
                    <p><i>You will know that a report was successful if you get a little message below the 'Yes' and 'No' buttons.</i></p>
                    <form>
                        <label>Message: </label>
                        <input 
                            type="text"
                            value={ form.message }
                            onChange={ e => setForm({ error: null, message: e.target.value }) }
                            disabled={ reportMessage }
                        />
                        { form.error ? <p>{ form.error }</p> : null }
                    </form>
                    <button onClick={ handleReport } disabled={ reportMessage }>Yes</button>
                    <button onClick={ closePopup } disabled={ reportMessage }>No</button>
                    { reportMessage ? <p>{ reportMessage }</p> : null }
                </div>
            </div>
        :
            null
    );
};

/* ===== EXPORTS ===== */
export default ReportPopup;