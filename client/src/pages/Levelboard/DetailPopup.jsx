/* ===== IMPORTS ===== */
import { useLocation } from "react-router-dom";
import CheckIcon from "@mui/icons-material/Check";
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import EmbedHelper from "../../helper/EmbedHelper";
import EmbededVideo from "../../components/EmbededVideo/EmbededVideo.jsx";
import FrontendHelper from "../../helper/FrontendHelper.js";
import LevelboardRecord from "./LevelboardRecord";
import Username from "../../components/Username/Username.jsx";

function DetailPopup({ submission, setSubmission }) {
  /* ===== VARIABLES ===== */
  const location = useLocation();
  const level = location.pathname.split("/")[5];
  const details = submission ? submission.details : undefined;
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
          <button onClick={ () => setSubmission(undefined) }>Close</button>
        </div>

        { /* Popup header - render the name of the level, the record, and the username */ }
        <h1>
          { cleanLevelName(level) }:&nbsp;
          <LevelboardRecord submission={ submission } iconSize={ "large" } /> by&nbsp;
          <Username country={ profile.country } profileId={ profile.id } username={ profile.username } />
        </h1>

        { /* Levelboard details popup video - render the embeded video within this container */ }
        <div className={ getUrlType(details.proof) !== "twitter" ? "levelboard-detail-popup-video" : "" }>
          <EmbededVideo url={ details.proof } />
        </div>

        { /* Levelboard details popup info - render the submission details within this unordered list */ }
        <ul className="levelboard-detail-popup-info">
          <li>Position: { submission.position }</li>
          <li>Date: { dateB2F(details.submitted_at) }</li>
          <li>Region: { details.region.region_name }</li>
          <li>Monkey: { details.monkey.monkey_name }</li>
          <li>Live:&nbsp;
            <span className="levelboard-aligned-span">
              { details.live ? <CheckIcon /> : <CloseRoundedIcon /> }
            </span>
          </li>
          { details.comment && <li>Comment: "{ details.comment }"</li> }
        </ul>

      </div>
    </div>;
};

/* ===== EXPORTS ===== */
export default DetailPopup;