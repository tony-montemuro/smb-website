/* ===== IMPORTS ===== */
import { useLocation } from "react-router-dom";
import CheckIcon from "@mui/icons-material/Check";
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import EmbedHelper from "../../helper/EmbedHelper";
import EmbededVideo from "../../components/EmbededVideo/EmbededVideo.jsx";
import FrontendHelper from "../../helper/FrontendHelper";
import Username from "../../components/Username/Username";

function DetailPopup({ submission, setSubmission, profile }) {
  /* ===== VARIABLES ===== */
  const location = useLocation();
  const path = location.pathname.split("/");
  const type = path[4];
  const level = path[5];
  
  /* ===== FUNCTIONS ===== */

  // helper functions
  const { cleanLevelName, recordB2F, dateB2F, getTimeAgo } = FrontendHelper();
  const { getUrlType } = EmbedHelper();

  /* ===== DETAIL POPUP COMPONENT ===== */
  return submission &&
    <div className="submission-history-popup">
      <div className="submission-history-popup-inner">

        { /* Button to close the popup */ }
        <div className="submission-history-popup-close-btn">
          <button onClick={ () => setSubmission(undefined) }>Close</button>
        </div>

        { /* Popup header - render the name of the level, the record, and the username */ }
        <h1>
          { cleanLevelName(level) }:&nbsp;
          { recordB2F(submission.record, type) } by&nbsp;
          <Username country={ profile.country.iso2 } profileId={ profile.id } username={ profile.username } />
        </h1>

        { /* Submission history popup video - render the embeded video within this container */ }
        <div className={ getUrlType(submission.proof) !== "twitter" ? "submission-history-popup-video" : "" }>
          <EmbededVideo url={ submission.proof } />
        </div>

        { /* Submission history popup info - render the submission details within this unordered list */ }
        <ul className="levelboard-detail-popup-info">
          <li>Submitted: { getTimeAgo(submission.id) }</li>
          <li>Position: { submission.all_position }</li>
          { submission.live && <li>Live Position: { submission.position }</li> }
          <li>Date: { dateB2F(submission.submitted_at) }</li>
          <li>Monkey: { submission.monkey.monkey_name }</li>
          <li>Region: { submission.region.region_name }</li>
          <li>Live:&nbsp;
            <span className="submission-history-svg-wrapper">
              { submission.live ? <CheckIcon /> : <CloseRoundedIcon /> }
            </span>
          </li>
          { submission.comment && <li>Comment: "{ submission.comment }"</li> }
        </ul>

      </div>
    </div>;
};

/* ===== EXPORTS ===== */
export default DetailPopup;