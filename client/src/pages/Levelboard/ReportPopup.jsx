/* ===== IMPORTS ===== */
import "./Levelboard.css";
import { useLocation } from "react-router-dom";
import FrontendHelper from "../../helper/FrontendHelper";
import ReportPopupLogic from "./ReportPopup.js";
import Username from "../../components/Username/Username";

function ReportPopup({ submission, setSubmission }) {
  /* ===== VARIABLES ===== */
  const location = useLocation();
	const type = location.pathname.split("/")[4];
  const TEXT_AREA_ROWS = 2;

  /* ===== STATES AND FUNCTIONS ===== */

  // states and functions from js file
  const { form, handleReport, handleChange, closePopup } = ReportPopupLogic();

  // helper functions
  const { recordB2F } = FrontendHelper();

  /* ===== REPORT POPUP COMPONENT ===== */
  return submission &&
    <div className="levelboard-popup">
      <div className="levelboard-popup-inner">

        { /* Close popup button */ }
        <div className="levelboard-popup-close-btn">
          <button onClick={ () => closePopup(setSubmission) } disabled={ form.submitting }>Close</button>
        </div>

        { /* Report popup header */ }
        <h2>Are you sure you want to report the following { type }: { recordB2F(submission.details.record, type) } by&nbsp; 
        <Username country={ submission.profile.country } profileId={ submission.profile.id } username={ submission.profile.username } />?</h2>

        { /* Report popup description */ }
        <span>In your message, please explain your reasoning for reporting the submission. This message will be delivered to&nbsp;
        <Username country={ submission.profile.country } profileId={ submission.profile.id } username={ submission.profile.username } />,
        as well as the moderation team.</span>

        <p><b>Note:</b> <i>Please only report once! Repeatedly reporting a single submission can result in a permanent account ban!</i></p>
        
        { /* Report form */ }
        <form>

          { /* Message input - a text field where the user must include a message with their report */ }
          <div className="levelboard-textarea-group">
            <label>Message: </label>
            <textarea 
              value={ form.message }
              onChange={ handleChange }
              disabled={ form.submitted }
              rows={ TEXT_AREA_ROWS }
            >
            </textarea>
          </div>

          { /* Render the form error under this input, if an error is defined */ }
          { form.error && <p>{ form.error }</p> }

        </form>

        { /* Report popup buttons */ }
        <div className="levelboard-decision-btns">
          { /* Button that, when pressed, reports the submission */ }
          <button onClick={ () => handleReport(submission, setSubmission) } disabled={ form.submitting || form.submitted }>Yes</button>

          { /* Button that, when pressed, closes the popup */ }
          <button onClick={ () => closePopup(setSubmission) } disabled={ form.submitting || form.submitted }>No</button>
        </div>

        { /* If the report was successfully submitted, render a success message at the bottom of the popup */ }
        { form.submitted && 
          <div className="levelboard-report-message">
            <span>
              Report was successful. All moderators, as well as&nbsp;
              <Username country={ submission.profile.country } profileId={ submission.profile.id } username={ submission.profile.username } />,&nbsp;
              have been notified.
            </span> 
          </div> 
        }

      </div>
    </div>
};

/* ===== EXPORTS ===== */
export default ReportPopup;