/* ===== IMPORTS ===== */
import { useContext } from "react";
import { useLocation } from "react-router-dom";
import { UserContext } from "../../Contexts";
import CheckIcon from "@mui/icons-material/Check";
import ClearRoundedIcon from "@mui/icons-material/ClearRounded";
import FrontendHelper from "../../helper/FrontendHelper";
import LaunchIcon from "@mui/icons-material/Launch";

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
      <td>
        { submission.proof && 
          <div className="record-history-svg-wrapper">
            <a href={ submission.proof } target="_blank" rel="noopener noreferrer"><LaunchIcon fontSize="small" /></a>
          </div>
        }
      </td>

      { /* Comment - render submission comment, if there is one */ }
      <td>{ submission.comment }</td>

      { /* Live status - Render checkbox if live */ }
      <td>{ submission.live && <div className="record-history svg-wrapper"><CheckIcon /></div>  }</td>

      { /* Position - Render the position of the submission (live only) */ }
      <td>{ submission.position ? submission.position : "-" }</td>

      { /* All Position - Render the overall position of the submission */ }
      <td>{ submission.all_position }</td>

      { /* Delete Button - Render delete button for moderators only so that they can delete a submission. */ }
      { user.is_mod && 
        <td>
          <div className="record-history-svg-wrapper">
            <button onClick={ () => deleteFunc(submission) }><ClearRoundedIcon /></button>
          </div>
        </td> 
      }
      
    </tr>
  );
};

/* ===== EXPORTS ===== */
export default FilteredSubmissionRow;