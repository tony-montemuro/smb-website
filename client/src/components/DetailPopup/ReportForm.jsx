/* ===== IMPORTS ===== */
import { useContext } from "react";
import { UserContext } from "../../utils/Contexts";
import CountdownTimer from "../CountdownTimer/CountdownTimer.jsx";
import ReportFormLogic from "./ReportForm.js";

function ReportForm({ submission, closePopup }) {
  /* ===== VARIABLES ===== */
  const TEXT_AREA_ROWS = 2;

  /* ===== CONTEXTS ===== */

  // user state from user context
  const { user } = useContext(UserContext);

  /* ===== STATES AND FUNCTIONS ===== */

  // states and functions from js file
  const { form, handleReport, handleChange } = ReportFormLogic();

  /* ===== REPORT FORM COMPONENT ===== */
  return (
    <div className="detail-popup-report">

      { submission.report ?

        // If the submission is already reported, render a message letting the user know they are unable to report it again
        <h2>This submission has already been reported, so it cannot be reported again.
        Please wait for moderator to handle this submission.</h2>
      :
        submission.profile.id === user.profile.id ?

          // If the submission belongs to the current user, render message that lets user know they cannot report their own submission
          <h2>You cannot report your own submission.</h2>

        :

          // Otherwise, render the report form
          <>
            { /* Report form header */ }
            <h2>If this submission has issues, report it here.</h2>
      
            { /* Report form description */ }
            <span>In your message, please explain your reasoning for reporting the submission. Be specific!</span>
            <p>You have <b>{ user.profile.report_token }</b> reports left. Report counts reset in <CountdownTimer />.</p>
            
            { /* Report form */ }
            <form onSubmit={ (e) => handleReport(e, submission, closePopup) }>
      
              { /* Message input - a text field where the user must include a message with their report */ }
              <div className="detail-textarea-group">
                <label>Message: </label>
                <textarea 
                  value={ form.message }
                  onChange={ handleChange }
                  rows={ TEXT_AREA_ROWS }
                >
                </textarea>
              </div>
      
              { /* Render the form error under this input, if an error is defined */ }
              { form.error && <p>{ form.error }</p> }

              { /* Report form button */ }
              <div className="detail-decision-btns">

                { /* Button that, when pressed, reports the submission */ }
                <button type="submit" disabled={ form.submitting }>
                  Submit Report
                </button>

              </div>
      
            </form>
          </>
      }

    </div>
  );
};

/* ===== EXPORTS ===== */
export default ReportForm;