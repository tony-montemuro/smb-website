/* ===== IMPORTS ===== */
import { useLocation } from "react-router-dom";
import CheckIcon from "@mui/icons-material/Check";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import EmbedHelper from "../../helper/EmbedHelper";
import EmbededVideo from "../../components/EmbededVideo/EmbededVideo.jsx";
import FrontendHelper from "../../helper/FrontendHelper.js";
import LevelboardRecord from "./LevelboardRecord";
import ReportForm from "./ReportForm.jsx";
import Username from "../../components/Username/Username.jsx";

function DetailPopup({ submission, setSubmission }) {
  /* ===== VARIABLES ===== */
  const location = useLocation();
  const level = location.pathname.split("/")[5];
  const profile = submission ? submission.profile : undefined;

  /* ===== FUNCTIONS ===== */

  // helper functions
  const { dateB2F, cleanLevelName } = FrontendHelper();
  const { getUrlType } = EmbedHelper();

  /* ===== DETAIL POPUP COMPONENT ===== */
  return submission &&
    <div className="levelboard-popup">
      <div className="levelboard-detail-popup-inner">

        { /* Button to close the popup */ }
        <div className="levelboard-popup-close-btn">
          <button type="button" onClick={ () => setSubmission(undefined) }>Close</button>
        </div>

        { /* Popup header - render the name of the level, the record, and the username */ }
        <h1>
          { cleanLevelName(level) }:&nbsp;
          <LevelboardRecord submission={ submission } iconSize={ "large" } /> by&nbsp;
          <Username country={ profile.country } profileId={ profile.id } username={ profile.username } />
        </h1>

        { /* Levelboard details popup video - render the embeded video within this container */ }
        <div className={ getUrlType(submission.proof) !== "twitter" ? "levelboard-detail-popup-video" : "" }>
          <EmbededVideo url={ submission.proof } />
        </div>

        { /* Levelboard details popup info - render the submission details within this unordered list */ }
        <ul className="levelboard-detail-popup-info">
          <li>Position: { submission.position }</li>
          <li>Date: { dateB2F(submission.submitted_at) }</li>
          <li>Monkey: { submission.monkey.monkey_name }</li>
          <li>Platform: { submission.platform.platform_name }</li>
          <li>Region: { submission.region.region_name }</li>
          <li>Live:&nbsp;
            <div className="levelboard-svg-wrapper">
              { submission.live ? <CheckIcon /> : <CloseRoundedIcon /> }
            </div>
          </li>
          { submission.comment && <li>Comment: "{ submission.comment }"</li> }
        </ul>

        { /* Horizontal rule to break the "submission" from the "report" form */ }
        <hr />

        <ReportForm submission={ submission } />

      </div>
    </div>;
};

/* ===== EXPORTS ===== */
export default DetailPopup;