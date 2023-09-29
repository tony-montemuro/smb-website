/* ===== IMPORTS ===== */
import { Link } from "react-router-dom";
import { PopupContext, UserContext } from "../../utils/Contexts";
import { useContext } from "react";
import CheckmarkOrX from "./CheckmarkOrX";
import FrontendHelper from "../../helper/FrontendHelper";
import NotificationBasicInfo from "./NotificationBasicInfo";
import NotificationMessage from "./NotificationMessage";
import NotificationProof from "./NotificationProof";
import Username from "../../components/Username/Username";

function Report() {
  /* ===== CONTEXTS ===== */

  // popup data state from popup context
  const { popupData } = useContext(PopupContext);

  // user state from user context
  const { user } = useContext(UserContext);

  /* ===== VARIABLES ===== */
  const notification = popupData;
  const submission = notification.submission;
  const type = notification.score ? "score" : "time";

  /* ===== FUNCTIONS ===== */

  // helper functions
  const { capitalize, dateB2F, recordB2F } = FrontendHelper();

  /* ===== REPORT COMPONENT ===== */
  return (
    <div className="notifications-report">

      { /* Popup header - includes a link to the reporter's user page */ }
      <h2>
        <Username profile={ notification.creator } />
        &nbsp;has reported { user.id === submission.profile.id ? "your" : "the following" } submission:
      </h2>

      { /* Notification details */ }
      <div className="notifications-details-wrapper">
        <div className="notifications-details">
          
          <ul>

            { /* Render the owner of the reported submission. If the report is for the current user, we do not need to render. */ }
            { user.profile.id !== submission.profile.id && 
              <li>User:&nbsp;<Link to={ `/user/${ submission.profile.id }`}>{ submission.profile.username }</Link></li>
            }

            { /* Render basic information about submission - includes the game, as well as level */ }
            <NotificationBasicInfo notification={ notification } />

            {/* Render the record */}
            <li>{ capitalize(type) }: { recordB2F(notification.record, type, notification.level.timer_type) }</li>

            { /* Render the submission date */ }
            <li>Date: { dateB2F(submission.submitted_at) }</li>

            { /* Render the monkey used in the submission */ }
            <li>Monkey: { submission.monkey.monkey_name }</li>

            { /* Render the platform of the submission */ }
            <li>Platform: { submission.platform.platform_name }</li>

            { /* Render the region of the submission */ }
            <li>Region: { submission.region.region_name }</li>

            { /* Render the proof of the submission */ }
            <li><NotificationProof proof={ submission.proof } /></li>

            { /* Render whether or not the submission was live */ }
            <li>Live Proof: <CheckmarkOrX isChecked={ submission.live } /></li>

            { /* Render whether or not the submission used tools */ }
            <li>TAS: <CheckmarkOrX isChecked={ submission.tas } /></li>

            { /* Render the submission comment, if there is one */ }
            { submission.comment && <li>Comment: { submission.comment }</li> }

          </ul>
        </div>
      </div>

      { /* Render the message associated with the submission, if there is one. */ }
      <NotificationMessage message={ notification.message } notification={ notification } />

      { /* Render a disclaimer message about reports. */ }
      <p><b>Note: </b><i>It is suggested that you ensure all properties of your submission are valid. If you are confident
      your submission is fine, do not worry. If not, a moderator may be forced to delete your submission!</i></p>
      <p><i>If a moderator falsely deletes any of your submissions, please contact the moderation team.</i></p>
        
    </div>
  );
};

/* ===== EXPORTS ===== */
export default Report;