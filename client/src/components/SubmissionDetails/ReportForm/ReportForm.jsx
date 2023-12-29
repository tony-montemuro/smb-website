/* ===== IMPORTS ===== */
import { PopupContext, UserContext } from "../../../utils/Contexts";
import { useContext, useState } from "react";
import { useLocation } from "react-router-dom";
import styles from "./ReportForm.module.css";
import CountdownTimer from "../../CountdownTimer/CountdownTimer.jsx";
import ReportFormLogic from "./ReportForm.js";
import TextField from "@mui/material/TextField";

function ReportForm({ updateBoard }) {
  /* ===== CONTEXTS ===== */

  // popup data state from popup context
  const { popupData } = useContext(PopupContext);

  // user state and isModerator function from user context
  const { user, isModerator } = useContext(UserContext);

  /* ===== VARIABLES ===== */
  const submission = popupData;
  const MESSAGE_MAX_LENGTH = 100;
  const TEXT_AREA_ROWS = 2;
  const location = useLocation();
  const path = location.pathname.split("/");
  const abb = path[2];
  const type = path[4];

  /* ===== STATES AND FUNCTIONS ===== */
  const [submitting, setSubmitting] = useState(false);

  // states and functions from js file
  const { message, handleReport, handleChange } = ReportFormLogic();

  /* ===== REPORT FORM COMPONENT ===== */
  return (
    <>
      { submission.report ?

        // If the submission is already reported, render a message letting the user know they are unable to report it again
        <h2>This submission has already been reported, so it cannot be reported again.
        Please wait for a moderator to handle this submission.</h2>

      :
        <>
          { /* Report form information - tell the user about reporting this submission */ }
          { submission.profile.id === user.profile.id ?
            <>
              <h2>If your submission has a { type } typo...</h2>
              <p>Report it here to alert a moderator, and resubmit with the corrected { type }. Any other typos can be corrected by selecting the <strong>Update Submissions</strong> button.</p>
            </>
          :
            <>
              <h2>If this submission has issues, report it here.</h2>
              <p>In your message, please explain your reasoning for reporting the submission. Be specific!</p>
              
              {/* Only render report token's if current user is "normal" (non-admin & non-moderator) */}
              { !isModerator(abb) &&
                <p>You have <b>{ user.profile.report_token }</b> reports left. Report count resets in <CountdownTimer />.</p>  
              }
            </>
          }
          
          { /* Report form - allow user to leave a message with the report */ }
          <form onSubmit={ (e) => handleReport(e, submission, setSubmitting, updateBoard) }>
            <div className={ styles.formWrapper }>

              { /* Render a text field for the user to enter a message with their report */ }
              <TextField
                fullWidth
                helperText={ `${ message.length }/${ MESSAGE_MAX_LENGTH }` }
                id="message"
                inputProps={ { maxLength: MESSAGE_MAX_LENGTH } }
                label="Message"
                multiline
                placeholder="Must be under 100 characters"
                required
                rows={ TEXT_AREA_ROWS }
                onChange={ handleChange }
                value={ message }
                variant="filled"
              />
      
              { /* Button that, when pressed, reports the submission */ }
              <button type="submit" disabled={ submitting }>
                Submit Report
              </button>

            </div>
          </form>
        </>
      }
    </>
  );
};

/* ===== EXPORTS ===== */
export default ReportForm;