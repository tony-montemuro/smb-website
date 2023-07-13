/* ===== IMPORTS ===== */
import { useContext } from "react";
import { useLocation } from "react-router-dom";
import { UserContext } from "../../utils/Contexts";
import CheckIcon from "@mui/icons-material/Check";
import ClearRoundedIcon from "@mui/icons-material/ClearRounded";
import FrontendHelper from "../../helper/FrontendHelper";
import VideocamIcon from "@mui/icons-material/Videocam";

function FilteredSubmissionRow({ submission, deleteFunc }) {
  /* ===== CONTEXTS ===== */
  
  // user state from user context
  const { user } = useContext(UserContext);

  /* ===== VARIABLES ===== */
	const location = useLocation();
	const type = location.pathname.split("/")[4];
  const current = submission.submission ? submission.submission[0] : undefined;
  // cannot delete a submission if:
  // a.) a current submission exists where it's approved, or 
  // b.) a current submission exists where it has a report that was created by the moderator, or is on a submission by the moderator 
  const cantDelete = current && (current.approved || (current.report && (current.profile_id !== user.profile.id || current.creator_id !== user.profile.id)));

  /* ===== FUNCTIONS ===== */

  // helper functions
  const { dateB2F, recordB2F, getTimeAgo } = FrontendHelper();

  /* ===== FILTERED SUBMISSION ROW COMPONENT ===== */
  return (
    <tr>
      { /* Submitted - render how long ago the submission was posted. */ }
      <td>{ getTimeAgo(submission.id) }</td>

      { /* Record - render the record itself */ }
      <td>{ recordB2F(submission.record, type) }</td>

      { /* Date - render the submission date provided by the submitter */ }
      <td>{ dateB2F(submission.submitted_at) }</td>

      { /* Region - render the region of the submission */ }
      <td>{ submission.region.region_name }</td>

      { /* Monkey name - render the monkey of the submission */ }
      <td>{ submission.monkey.monkey_name }</td>

      { /* Proof - render a videocam svg that links to the proof, if there is any */ }
      <td>
        { submission.proof && 
          <div className="record-history-svg-wrapper">
            <a href={ submission.proof } target="_blank" rel="noopener noreferrer">
              <VideocamIcon sx={{ color: "black" }} />
            </a>
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
            <button 
              type="button" 
              onClick={ () => deleteFunc(submission) } 
              disabled={ cantDelete }
              title={ cantDelete ? "Unable to delete this submission." : undefined }
            >
              <ClearRoundedIcon />
            </button>
          </div>
        </td>
      }
      
    </tr>
  );
};

/* ===== EXPORTS ===== */
export default FilteredSubmissionRow;