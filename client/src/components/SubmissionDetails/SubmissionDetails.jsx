/* ===== IMPORTS ===== */
import { LivePosition, Position, PositionDisclaimer } from "../Positions/Positions.jsx";
import { PopupContext, UserContext } from "../../utils/Contexts";
import { useContext } from "react";
import { useLocation } from "react-router-dom";
import styles from "./SubmissionDetails.module.css";
import CheckIcon from "@mui/icons-material/Check";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import DetailedRecord from "../DetailedRecord/DetailedRecord.jsx";
import EmbededVideo from "../EmbededVideo/EmbededVideo.jsx";
import FancyLevel from "../FancyLevel/FancyLevel.jsx";
import FrontendHelper from "../../helper/FrontendHelper.js";
import ReportForm from "./ReportForm/ReportForm.jsx";
import Username from "../Username/Username.jsx";

function SubmissionDetails({ level, updateBoards }) {
  /* ===== CONTEXTS ===== */
  
  // user state from user context
  const { user } = useContext(UserContext);

  // popup date state from popup context
  const { popupData } = useContext(PopupContext);

  /* ===== VARIABLES ===== */
  const submission = popupData;
  console.log(submission);
  
  const location = useLocation();
  const levelName = location.pathname.split("/")[5];
  const profile = submission.profile;

  /* ===== FUNCTIONS ===== */

  // helper functions
  const { dateB2F } = FrontendHelper();

  /* ===== SUBMISSION DETAILS COMPONENT ===== */
  return (
    <div className={ styles.submissionDetails }>

      { /* Popup header - render the name of the level, the record, and the username */ }
      <h1>
        <FancyLevel level={ levelName } />
      </h1>

      <h2>
        <DetailedRecord submission={ submission } iconSize="large" timerType={ level.timer_type } /> by&nbsp;
        <Username profile={ profile } />
      </h2>

      { /* Render a special message if the submission used tools. */ }
      { submission.tas && <p><b>Note:</b> This run is tool-assisted (TAS), and will not count toward any rankings.</p> }

      <hr />

      { /* Submission details video - render the embeded video within this container */ }
      <div className={ styles.video }>
        <EmbededVideo url={ submission.proof } />
      </div>

      { /* Submission disclaimer - render a disclaimer to the user explaining the position fields (only should render
        if `all_position` field is present) */ }
      { submission.all_position && <PositionDisclaimer /> }

      <hr />

      { /* Submission details info - render the submission details within this unordered list */ }
      <ul className={ styles.details }>

        { /* Render the submission differently, depending on whether or not `all_position` is defined. */ }
        { submission.all_position ?
          <>
            { /* Submission info - render both the position and live position fields */ }
            <li>
              <span className={ styles.label }>Position:</span>&nbsp;
              <Position position={ submission.all_position } id={ submission.id } submittedAt={ submission.submitted_at } />
            </li>
            <li>
              <span className={ styles.label }>Live Position:</span>&nbsp;
              <LivePosition position={ submission.position } id={ submission.id } submittedAt={ submission.submitted_at } />
            </li> 

          </>
        :
          <li><span className={ styles.label }>Position:</span>&nbsp;{ submission.position }</li>
        }
        
        <li><span className={ styles.label }>Date:</span>&nbsp;{ dateB2F(submission.submitted_at) }</li>
        <li><span className={ styles.label }>Monkey:</span>&nbsp;{ submission.monkey.monkey_name }</li>
        <li><span className={ styles.label }>Platform:</span>&nbsp;{ submission.platform.platform_name }</li>
        <li><span className={ styles.label }>Region:</span>&nbsp;{ submission.region.region_name }</li>
        <li><span className={ styles.label }>Live:</span>&nbsp;
          <div className={ styles.svgWrapper }>
            { submission.live ? <CheckIcon titleAccess="This submission has a live proof." /> : <CloseRoundedIcon titleAccess="This submission has no live proof." /> }
          </div>
        </li>
        { submission.comment && 
          <li><span className={ styles.label }>Comment:</span>&nbsp;"{ submission.comment }"</li> 
        }
        { submission.mod_note &&
          <li><span className={ styles.label }>Moderator Note:</span>&nbsp;"{ submission.mod_note }"</li>
        }

      </ul>

      { /* If user is authenticated, render the ReportForm */ }
      { user.profile &&
        <>
          <hr />
          <ReportForm updateBoards={ updateBoards } />
        </>
      }

    </div>
  );
};

/* ===== EXPORTS ===== */
export default SubmissionDetails;