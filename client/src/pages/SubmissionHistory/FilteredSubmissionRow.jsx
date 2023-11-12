/* ===== IMPORTS ===== */
import styles from "./SubmissionHistory.module.css";
import ChatBubbleRoundedIcon from "@mui/icons-material/ChatBubbleRounded";
import CheckIcon from "@mui/icons-material/Check";
import DetailedRecord from "../../components/DetailedRecord/DetailedRecord.jsx";
import FrontendHelper from "../../helper/FrontendHelper";
import LiveIcon from "../../assets/svg/Icons/LiveIcon.jsx";
import VideocamIcon from "@mui/icons-material/Videocam";

function FilteredSubmissionRow({ submission, level, onClickFunc }) {
  /* ===== FUNCTIONS ===== */

  // helper functions
  const { dateB2F, getTimeAgo } = FrontendHelper();

  /* ===== FILTERED SUBMISSION ROW COMPONENT ===== */
  return (
    <tr className={ styles.row } onClick={ () => onClickFunc(submission) }>
      { /* Date - render the submission date provided by the submitter */ }
      <td>{ dateB2F(submission.submitted_at) }</td>

      { /* Submitted - render how long ago the submission was posted. */ }
      <td>{ getTimeAgo(submission.id) }</td>

      { /* Record - render the record itself */ }
      <td><DetailedRecord submission={ submission } iconSize="small" timerType={ level.timer_type } /></td>

      { /* Monkey name - render the monkey of the submission */ }
      <td>{ submission.monkey.monkey_name }</td>

      { /* Platform abb - render the platform abbreviation of the submission */ }
      <td>{ submission.platform.platform_abb }</td>

      { /* Region - render the region of the submission */ }
      <td>{ submission.region.region_name }</td>

      { /* Proof - render a videocam svg that links to the proof, if there is any */ }
      <td>
        { submission.proof && 
          <div className={ styles.svgWrapper }>
            { submission.live ? <LiveIcon /> : <VideocamIcon titleAccess="Has proof" /> }
          </div>
        }
      </td>

      { /* Comment - render submission comment, if there is one */ }
      <td>
        { submission.comment &&
          <div className={ styles.svgWrapper }>
            <ChatBubbleRoundedIcon titleAccess={ submission.comment } fontSize="small" />
          </div>
        }
      </td>

      { /* Live status - Render checkbox if live */ }
      <td>
        { submission.live && 
          <div className={ styles.svgWrapper }>
            <CheckIcon titleAccess="Live proof" />
          </div>
        }
      </td>

      { /* Position - Render the overall position of the submission */ }
      <td>{ submission.all_position }</td>

      { /* Live Position - Render the position of the submission (live only) */ }
      <td>{ submission.position ? submission.position : "-" }</td>
      
    </tr>
  );
};

/* ===== EXPORTS ===== */
export default FilteredSubmissionRow;