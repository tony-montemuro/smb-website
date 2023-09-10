/* ===== IMPORTS ===== */
import { useLocation } from "react-router-dom";
import ChatBubbleRoundedIcon from "@mui/icons-material/ChatBubbleRounded";
import CheckIcon from "@mui/icons-material/Check";
import FrontendHelper from "../../helper/FrontendHelper";
import VideocamIcon from "@mui/icons-material/Videocam";

function FilteredSubmissionRow({ submission, level, onClickFunc }) {
  /* ===== VARIABLES ===== */
	const location = useLocation();
	const type = location.pathname.split("/")[4];

  /* ===== FUNCTIONS ===== */

  // helper functions
  const { dateB2F, recordB2F, getTimeAgo } = FrontendHelper();

  /* ===== FILTERED SUBMISSION ROW COMPONENT ===== */
  return (
    <tr onClick={ () => onClickFunc(submission) }>
      { /* Date - render the submission date provided by the submitter */ }
      <td>{ dateB2F(submission.submitted_at) }</td>

      { /* Submitted - render how long ago the submission was posted. */ }
      <td>{ getTimeAgo(submission.id) }</td>

      { /* Record - render the record itself */ }
      <td>{ recordB2F(submission.record, type, level.timer_type) }</td>

      { /* Monkey name - render the monkey of the submission */ }
      <td>{ submission.monkey.monkey_name }</td>

      { /* Platform abb - render the platform abbreviation of the submission */ }
      <td>{ submission.platform.platform_abb }</td>

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

      { /* TAS - Render the phrase "TAS" if submission is marked as TAS, otherwise nothing */ }
      <td>{ submission.tas && "TAS" }</td>
      
    </tr>
  );
};

/* ===== EXPORTS ===== */
export default FilteredSubmissionRow;