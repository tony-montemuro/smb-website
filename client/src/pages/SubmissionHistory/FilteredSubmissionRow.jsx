/* ===== IMPORTS ===== */
import { useContext } from "react";
import { useLocation } from "react-router-dom";
import { UserContext } from "../../utils/Contexts";
import ChatBubbleRoundedIcon from "@mui/icons-material/ChatBubbleRounded";
import CheckIcon from "@mui/icons-material/Check";
import ClearRoundedIcon from "@mui/icons-material/ClearRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import FrontendHelper from "../../helper/FrontendHelper";
import SubmissionHistoryLogic from "./SubmissionHistory.js";
import VideocamIcon from "@mui/icons-material/Videocam";

function FilteredSubmissionRow({ submission, updateFunc, deleteFunc, onClickFunc }) {
  /* ===== CONTEXTS ===== */
  
  // user state from user context
  const { user } = useContext(UserContext);

  /* ===== VARIABLES ===== */
	const location = useLocation();
	const type = location.pathname.split("/")[4];

  /* ===== FUNCTIONS ===== */

  // helper functions
  const { dateB2F, recordB2F, getTimeAgo } = FrontendHelper();

  // functions from the js file
  const { cantUpdate, cantDelete } = SubmissionHistoryLogic();

  /* ===== FILTERED SUBMISSION ROW COMPONENT ===== */
  return (
    <tr onClick={ () => onClickFunc(submission) }>
      { /* Submitted - render how long ago the submission was posted. */ }
      <td>{ getTimeAgo(submission.id) }</td>

      { /* Record - render the record itself */ }
      <td>{ recordB2F(submission.record, type) }</td>

      { /* Date - render the submission date provided by the submitter */ }
      <td>{ dateB2F(submission.submitted_at) }</td>

      { /* Monkey name - render the monkey of the submission */ }
      <td>{ submission.monkey.monkey_name }</td>

      { /* Region - render the region of the submission */ }
      <td>{ submission.region.region_name }</td>

      { /* Proof - render a videocam svg that links to the proof, if there is any */ }
      <td>
        { submission.proof && 
          <div className="submission-history-svg-wrapper">
            <VideocamIcon titleAccess="Has proof" sx={{ color: "black" }} />
          </div>
        }
      </td>

      { /* Comment - render submission comment, if there is one */ }
      <td>
        { submission.comment &&
          <div className="submission-history-svg-wrapper">
            <ChatBubbleRoundedIcon titleAccess={ submission.comment } fontSize="small" />
          </div>
        }
      </td>

      { /* Live status - Render checkbox if live */ }
      <td>
        { submission.live && 
          <div className="submission-history svg-wrapper">
            <CheckIcon titleAccess="Live proof" />
          </div>
        }
      </td>

      { /* Position - Render the overall position of the submission */ }
      <td>{ submission.all_position }</td>

      { /* Live Position - Render the position of the submission (live only) */ }
      <td>{ submission.position ? submission.position : "-" }</td>

      { /* Moderator-only columns */ }
      { user.is_mod && 
        <>

          {/* Update button - Render a button that allows the moderator to update a submission */}
          <td>
            <div className="submission-history-svg-wrapper">
              <button
                type="button" 
                onClick={ (e) => {
                  e.stopPropagation();
                  updateFunc(submission);
                 }} 
                disabled={ cantUpdate(submission) }
                title={ cantUpdate(submission) ? "Unable to update this submission." : undefined }
              >
                <EditRoundedIcon />
              </button>
            </div>
          </td>

          { /* Delete button - Render a button that allows the moderator to delete a submission. */ }
          <td>
            <div className="submission-history-svg-wrapper">
              <button 
                type="button" 
                onClick={ (e) => {
                  e.stopPropagation();
                  deleteFunc(submission);
                 }} 
                disabled={ cantDelete(submission) }
                title={ cantDelete(submission) ? "Unable to delete this submission." : undefined }
              >
                <ClearRoundedIcon />
              </button>
            </div>
          </td>

        </>
      }
      
    </tr>
  );
};

/* ===== EXPORTS ===== */
export default FilteredSubmissionRow;