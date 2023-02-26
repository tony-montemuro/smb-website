import "./levelboard.css";
import React, { useState } from "react";
import LevelboardHelper from "../../helper/LevelboardHelper";

function ReportPopup({ board, setBoard }) {
    /* ===== STATES ===== */
    const [form, setForm] = useState({ message: "", error: null });
    const [reportMessage, setReportMessage] = useState(null);

    /* ===== FUNCTIONS ===== */

    // helper functions
    const { validateMessage } = LevelboardHelper();

    const handleReport = () => {
        // first, verify that the message is valid
        const error = validateMessage(form.message);
        if (error) {
            setForm({ ...form, error: error });
            return;
        }

        console.log("The rest will be implemented soon!");
        setReportMessage(`Report was successful. All moderators, as well as ${ board.report.username }, have been notified.`);
    };

    return (
        board.report ?
            <div className="levelboard-popup">
                <div className="levelboard-popup-inner">
                    <h2>Are you sure you want to report the following { board.report.type }: { board.report.record } by { board.report.username }?</h2>
                    <p><b>Note:</b> <i>Please only report once! Repeatedly reporting a single submission can result in a permanent account ban!</i></p>
                    <form>
                        <label>Explain why you are reporting this submission: </label>
                        <input 
                            type="text"
                            value={ form.message }
                            onChange={ e => setForm({ error: null, message: e.target.value }) }
                        />
                        { form.error ? <p>{ form.error }</p> : null }
                    </form>
                    <button onClick={ handleReport }>Yes</button>
                    <button onClick={ () => setBoard({ ...board, report: null }) }>No</button>
                    { reportMessage ? <p>{ reportMessage }</p> : null }
                </div>
            </div>
        :
            null
    );
};

export default ReportPopup;