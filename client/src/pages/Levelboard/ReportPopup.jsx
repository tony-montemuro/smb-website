/* ===== IMPORTS ===== */
import "./Levelboard.css";
import ReportPopupLogic from "./ReportPopup.js";

function ReportPopup({ board, setBoard }) {
  /* ===== STATES AND FUNCTIONS ===== */
  const { form, reportMessage, handleReport, handleChange, closePopup } = ReportPopupLogic();

  /* ===== REPORT POPUP COMPONENT ===== */
  return (
    board.report &&
      <div className="levelboard-popup">
        <div className="levelboard-popup-inner">

          { /* Close popup button */ }
          <div className="report-levelboard-popup">
            <button onClick={ () => closePopup(board, setBoard) }>Close</button>
          </div>

          { /* Report description for user */ }
          <h2>Are you sure you want to report the following { board.report.type }: { board.report.record } by { board.report.username }?</h2>
          <p>In your message, please explain your reasoning for reporting the submission. This message will be delivered to { board.report.username },
          as well as the moderation team.</p>
          <p><b>Note:</b> <i>Please only report once! Repeatedly reporting a single submission can result in a permanent account ban!</i></p>
          <p><i>You will know that a report was successful if you get a little message below the 'Yes' and 'No' buttons.</i></p>
          
          { /* Report form */ }
          <form>

            { /* Message input - a text field where the user must include a message with their report */ }
            <label>Message: </label>
            <input 
              type="text"
              value={ form.message }
              onChange={ handleChange }
              disabled={ reportMessage }
            />

            { /* Render the form error under this input, if an error is defined */ }
            { form.error ? <p>{ form.error }</p> : null }

          </form>

          { /* Button that, when pressed, reports the submission */ }
          <button onClick={ () => handleReport(board.report) } disabled={ reportMessage }>Yes</button>

          { /* Button that, when pressed, closes the popup */ }
          <button onClick={ () => closePopup(board, setBoard) } disabled={ reportMessage }>No</button>

          { /* If the report message is set, render it at the bottom of the popup */ }
          { reportMessage && <p>{ reportMessage }</p> }

        </div>
      </div>
  );
};

/* ===== EXPORTS ===== */
export default ReportPopup;