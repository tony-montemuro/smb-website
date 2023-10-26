/* ===== IMPORTS ===== */
import styles from "./SubmissionHandler.module.css";
import FrontendHelper from "../../helper/FrontendHelper";
import SubmissionHandlerLogic from "./SubmissionHandler.js";
import Username from "../../components/Username/Username.jsx"

function SubmissionRow({ submission, onClick, isUnapproved }) {
  /* ===== FUNCTIONS ===== */

  // helper functions
  const { getTimeAgo, capitalize, cleanLevelName, recordB2F, categoryB2F } = FrontendHelper();
  const { isClickable } = SubmissionHandlerLogic(isUnapproved);
  
  /* ===== VARIABLES ===== */
  const canClick = isClickable(submission);
  const profile = submission.profile;
  const level = submission.level;
  const creator = !isUnapproved ? submission.report.creator : undefined;
  const type = submission.score ? "score" : "time";

  /* ===== SUBMISSION ROW COMPONENT ===== */
  return (
    <tr 
      className={ !canClick ? styles.notClickable : styles.clickable } 
      onClick={ canClick ? () => onClick(submission) : null } 
      title={ !canClick ? "Unable to handle reported submissions that you submitted or reported." : null }
    >

      { /* Render how long ago the submission was submitted */ }
      <td>
        <div>{ getTimeAgo(isUnapproved ? submission.id : submission.report.report_date) }</div>
      </td>

      { /* Render the username of the person who made the report, assuming `isUnapproved` is false (report submission) */ }
      { !isUnapproved &&
        <td>
          <div>
            <Username profile={ creator } disableLink />
          </div>
        </td>
      }

      { /* Render the username of the person who submitted it */ }
      <td>
        <div>
          <Username profile={ profile } disableLink />
        </div>
      </td>

      { /* Render the category of the level */ }
      <td>
        <div>{ categoryB2F(level.category) }</div>
      </td>

      { /* Render the name of the level, as well as the type of submission */ }
      <td>
        <div>
          { `${ cleanLevelName(level.name) } (${ capitalize(type) })` }
        </div>
      </td>

      { /* Render the record */ }
      <td>
        <div>{ recordB2F(submission.record, type, level.timer_type) }</div>
      </td>
      
    </tr>
  );
};

/* ===== EXPORTS ===== */
export default SubmissionRow;