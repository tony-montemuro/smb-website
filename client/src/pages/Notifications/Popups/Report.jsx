/* ===== IMPORTS ===== */
import { PopupContext, UserContext } from "../../../utils/Contexts";
import { useContext } from "react";
import styles from "./Popups.module.css";
import CheckmarkOrX from "./CheckmarkOrX";
import FrontendHelper from "../../../helper/FrontendHelper";
import NotificationBasicInfo from "./NotificationBasicInfo";
import NotificationMessage from "./NotificationMessage";
import NotificationProof from "./NotificationProof";
import Username from "../../../components/Username/Username.jsx";

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
    <>

      { /* Popup header - includes a link to the reporter's user page */ }
      <h2>
        <Username profile={ notification.creator } />
        &nbsp;has reported { user.id === submission.profile.id ? "your" : "the following" } submission:
      </h2>

      { /* Notification details - render nearly all information about notification */ }
      <div className={ styles.detailsWrapper }>
        <div className={ styles.details }>
          <ul>
            <NotificationBasicInfo notification={ notification } />
            <li>{ capitalize(type) }: { recordB2F(notification.record, type, notification.level.timer_type) }</li>
            <li>Date: { dateB2F(submission.submitted_at) }</li>
            <li>Monkey: { submission.monkey.monkey_name }</li>
            <li>Platform: { submission.platform.platform_name }</li>
            <li>Region: { submission.region.region_name }</li>
            <li><NotificationProof proof={ submission.proof } /></li>
            <li>Live Proof: <CheckmarkOrX isChecked={ submission.live } /></li>
            <li>TAS: <CheckmarkOrX isChecked={ submission.tas } /></li>
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
        
    </>
  );
};

/* ===== EXPORTS ===== */
export default Report;