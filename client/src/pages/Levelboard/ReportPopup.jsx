/* ===== IMPORTS ===== */
import "./Levelboard.css";
import { useContext } from "react";
import { useLocation } from "react-router-dom";
import { UserContext } from "../../utils/Contexts";
import CountdownTimer from "../../components/CountdownTimer/CountdownTimer.jsx";
import FrontendHelper from "../../helper/FrontendHelper";
import ReportPopupLogic from "./ReportPopup.js";
import Username from "../../components/Username/Username";

function ReportPopup({ submission, setSubmission }) {
  /* ===== VARIABLES ===== */
  const location = useLocation();
	const type = location.pathname.split("/")[4];
  const TEXT_AREA_ROWS = 2;

  /* ===== CONTEXTS ===== */

  // user state from user context
  const { user } = useContext(UserContext);

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
          <button type="button" onClick={ () => closePopup(setSubmission) } disabled={ form.submitting }>Close</button>
        </div>

        { /* Report popup header */ }
        <h2>Are you sure you want to report the following { type }: { recordB2F(submission.details.record, type) } by&nbsp; 
        <Username country={ submission.profile.country } profileId={ submission.profile.id } username={ submission.profile.username } />?</h2>

        { /* Report popup description */ }
        <span>In your message, please explain your reasoning for reporting the submission. Be specific!</span>

        <p>You have <b>{ user.profile.report_token }</b> reports left. Report counts reset in <CountdownTimer />.</p>
        
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
          <button type="submit" onClick={ () => handleReport(submission, setSubmission) } disabled={ form.submitting || form.submitted }>
            Yes
          </button>

          { /* Button that, when pressed, closes the popup */ }
          <button type="button" onClick={ () => closePopup(setSubmission) } disabled={ form.submitting || form.submitted }>No</button>
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