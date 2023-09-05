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
      <div className="levelboard-popup-inner" style={ { "minWidth": "40%" } }>

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

        { /* Render a special message if the submission used tools. */ }
        { submission.tas && <p id="levelboard-tas"><b>Note:</b> This run is a tool-assisted speedrun, and will not count toward any rankings.</p> }

        { /* Levelboard details popup video - render the embeded video within this container */ }
        <div className={ getUrlType(submission.proof) !== "twitter" ? "levelboard-detail-popup-video" : "" }>
          <EmbededVideo url={ submission.proof } />
        </div>

        { /* Levelboard details popup info - render the submission details within this unordered list */ }
        <ul className="levelboard-detail-popup-info">

          { /* Position - render the position of the submission */ }
          <li>Position: { submission.position }</li>

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
            <div className="levelboard-svg-wrapper">
              { submission.live ? <CheckIcon /> : <CloseRoundedIcon /> }
            </div>
          </li>

          { /* Comment: if a submission has a comment, render it here */ }
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