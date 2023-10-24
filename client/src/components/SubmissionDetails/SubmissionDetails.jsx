/* ===== IMPORTS ===== */
import "./SubmissionDetails.css";
import { PopupContext, UserContext } from "../../utils/Contexts";
import { useContext } from "react";
import { useLocation } from "react-router-dom";
import CheckIcon from "@mui/icons-material/Check";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import DetailedRecord from "../DetailedRecord/DetailedRecord.jsx";
import EmbedHelper from "../../helper/EmbedHelper";
import EmbededVideo from "../EmbededVideo/EmbededVideo.jsx";
import FrontendHelper from "../../helper/FrontendHelper.js";
import ReportForm from "./ReportForm.jsx";
import Username from "../Username/Username.jsx";

function SubmissionDetails({ level, updateBoard }) {
  /* ===== CONTEXTS ===== */
  
  // user state from user context
  const { user } = useContext(UserContext);

  // popup date state from popup context
  const { popupData } = useContext(PopupContext);

  /* ===== VARIABLES ===== */
  const submission = popupData;
  const location = useLocation();
  const levelName = location.pathname.split("/")[5];
  const profile = submission.profile;

  /* ===== FUNCTIONS ===== */

  // helper functions
  const { dateB2F, cleanLevelName } = FrontendHelper();
  const { getUrlType } = EmbedHelper();

  /* ===== DETAIL POPUP COMPONENT ===== */
  return (
    <div className="submission-details">

      { /* Popup header - render the name of the level, the record, and the username */ }
      <h1>
        { cleanLevelName(levelName) }:&nbsp;
        <DetailedRecord submission={ submission } iconSize="large" timerType={ level.timer_type } /> by&nbsp;
        <Username profile={ profile } />
      </h1>

      { /* Render a special message if the submission used tools. */ }
      { submission.tas && <p><b>Note:</b> This run is a tool-assisted speedrun, and will not count toward any rankings.</p> }

      { /* Submission details video - render the embeded video within this container */ }
      <div className={ getUrlType(submission.proof) !== "twitter" ? "submission-details-video" : "" }>
        <EmbededVideo url={ submission.proof } />
      </div>

      { /* Submission details info - render the submission details within this unordered list */ }
      <ul className="submission-details-info">

        { /* Render the submission differently, depending on whether or not `all_position` is defined. */ }
        { submission.all_position ?
          <>
            {/* Position - render the position at the time the user submitted it */}
            <li>Position: { submission.all_position }</li>

            { /* Live - render the "live" position at the time the user submitted it */ }
            { submission.live && <li>Live Position: { submission.position }</li> }
          </>
        :
          // Position - render the "relative" position of the submission (this depends on filters, typically)
          <li>Position: { submission.position }</li>
        }

        { /* Date - render the submission date */ }
        <li>Date: { dateB2F(submission.submitted_at) }</li>

        { /* Monkey - render the monkey used in the submission */ }
        <li>Monkey: { submission.monkey.monkey_name }</li>

        { /* Platform - render the platform the submission was achieved on */ }
        <li>Platform: { submission.platform.platform_name }</li>

        { /* Region - render the region the submission was achieved on */ }
        <li>Region: { submission.region.region_name }</li>

        { /* Live - render a checkbox if the submission has a live proof, otherwise an 'x' symbol */ }
        <li>Live:&nbsp;
          <div className="submission-details-svg-wrapper">
            { submission.live ? <CheckIcon /> : <CloseRoundedIcon /> }
          </div>
        </li>

        { /* Comment: if a submission has a comment, render it here */ }
        { submission.comment && <li>Comment: "{ submission.comment }"</li> }

      </ul>

      { /* If user is authenticated, render the ReportForm */ }
      { user.id &&
        <>
          { /* Horizontal rule to break the "submission" from the "report" form */ }
          <hr />

          <ReportForm updateBoard={ updateBoard } />
        </>
      }

    </div>
  );
};

/* ===== EXPORTS ===== */
export default SubmissionDetails;