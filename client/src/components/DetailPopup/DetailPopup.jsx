/* ===== IMPORTS ===== */
import "./DetailPopup.css";
import { UserContext } from "../../utils/Contexts";
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

function DetailPopup({ submission, closeDetailPopup, level }) {
  /* ===== VARIABLES ===== */
  const location = useLocation();
  const levelName = location.pathname.split("/")[5];
  const profile = submission ? submission.profile : undefined;

  /* ===== CONTEXTS ===== */
  
  // user state from user context
  const { user } = useContext(UserContext);

  /* ===== FUNCTIONS ===== */

  // helper functions
  const { dateB2F, cleanLevelName } = FrontendHelper();
  const { getUrlType } = EmbedHelper();

  /* ===== DETAIL POPUP COMPONENT ===== */
  return submission &&
    <div className="detail-popup">
      <div className="detail-popup-inner" style={ { "minWidth": "40%" } }>

        { /* Button to close the popup */ }
        <div className="detail-popup-close-btn">
          <button type="button" onClick={ () => closeDetailPopup(false) }>Close</button>
        </div>

        { /* Popup header - render the name of the level, the record, and the username */ }
        <h1>
          { cleanLevelName(levelName) }:&nbsp;
          <DetailedRecord submission={ submission } iconSize={ "large" } timerType={ level.timer_type } /> by&nbsp;
          <Username profile={ profile } />
        </h1>

        { /* Render a special message if the submission used tools. */ }
        { submission.tas && <p><b>Note:</b> This run is a tool-assisted speedrun, and will not count toward any rankings.</p> }

        { /* Details popup video - render the embeded video within this container */ }
        <div className={ getUrlType(submission.proof) !== "twitter" ? "detail-popup-video" : "" }>
          <EmbededVideo url={ submission.proof } />
        </div>

        { /* Details popup info - render the submission details within this unordered list */ }
        <ul className="detail-popup-info">

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
            <div className="detail-svg-wrapper">
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

            <ReportForm submission={ submission } closeDetailPopup={ closeDetailPopup } />
          </>
        }

      </div>
    </div>;
};

/* ===== EXPORTS ===== */
export default DetailPopup;