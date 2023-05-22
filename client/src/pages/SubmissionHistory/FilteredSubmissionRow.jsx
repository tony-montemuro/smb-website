/* ===== IMPORTS ===== */
import { useContext } from "react";
import { useLocation } from "react-router-dom";
import { UserContext } from "../../Contexts";
import FrontendHelper from "../../helper/FrontendHelper";

function FilteredSubmissionRow({ submission, deleteFunc }) {
  /* ===== VARIABLES ===== */
	const location = useLocation();
	const type = location.pathname.split("/")[4];

  /* ===== CONTEXTS ===== */
  
  // user state from user context
  const { user } = useContext(UserContext);

  /* ===== FUNCTIONS ===== */

  // helper functions
  const { dateB2F, recordB2F, getTimeDifference } = FrontendHelper();

  /* ===== FILTERED SUBMISSION ROW COMPONENT ===== */
  return (
    <tr>
      { /* Submitted - render how long ago the submission was posted. */ }
      <td>{ getTimeDifference(submission.id) }</td>

      { /* Record - render the record itself */ }
      <td>{ recordB2F(submission.record, type) }</td>

      { /* Date - render the submission date provided by the submitter */ }
      <td>{ dateB2F(submission.submitted_at) }</td>

      { /* Region - render the region of the submission */ }
      <td>{ submission.region.region_name }</td>

      { /* Monkey name - render the monkey of the submission */ }
      <td>{ submission.monkey.monkey_name }</td>

      { /* Proof - render a link to the proof, if there is any */ }
      <td>{ submission.proof ? <a href={ submission.proof } target="_blank" rel="noopener noreferrer">☑️</a> : null }</td>

      { /* Comment - render submission comment, if there is one */ }
      <td>{ submission.comment }</td>

      { /* Live status - Render "Live" if true, otherwise "Non-live" */ }
      <td>{ submission.live ? "Live" : "Non-live" }</td>

      { /* Position - Render the position of the submission (live only) */ }
      <td>{ submission.position ? submission.position : null }</td>

      { /* All Position - Render the overall position of the submission */ }
      <td>{ submission.all_position }</td>

      { /* Delete Button - Render delete button for moderators only so that they can delete a submission. */ }
      { user.is_mod && <td><button onClick={ () => deleteFunc(submission) }>❌</button></td> }
      
    </tr>
  );
};

/* ===== EXPORTS ===== */
export default FilteredSubmissionRow;