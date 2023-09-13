/* ===== IMPORTS ===== */
import "./Notifications.css";
import CheckmarkOrX from "./CheckmarkOrX";
import FrontendHelper from "../../helper/FrontendHelper";
import NotificationBasicInfo from "./NotificationBasicInfo";
import NotificationProof from "./NotificationProof";
import Username from "../../components/Username/Username";

function InsertPopup({ notifications, dispatchNotifications }) {
  /* ===== VARIABLES ===== */
  const notification = notifications.current;
  const submission = notification.submission;
  const type = notification.score ? "score" : "time";

  /* ===== FUNCTIONS ===== */

  // helper functions
  const { capitalize, dateB2F, recordB2F } = FrontendHelper();

  /* ===== INSERT NOTIFICATION POPUP ===== */
  return (
    <div className="notifications-popup">
      <div className="notifications-popup-inner">

        { /* Button to exit the popup */ }
         <button type="button" onClick={ () => dispatchNotifications({ field: "current", payload: null }) }>Close</button>

        { /* Popup header - includes a link to the moderator's user page */ }
        <h2>
          <Username profile={ notification.creator } />
          &nbsp;has submitted the following submission on your behalf: 
        </h2>

        { /* Notification details */ }
        <div className="notifications-details-wrapper">
          <div className="notifications-details">
            <ul>

              { /* Render basic information about submission - includes the game, as well as level */ }
              <NotificationBasicInfo notification={ notification } />

              { /* Render the record */ }
              <li>
                { capitalize(type) }: { recordB2F(notification.record, type, notification.level.timer_type) }
              </li>
              
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

              { /* Render whether or not the submission used TAS */ }
              <li>TAS: <CheckmarkOrX isChecked={ submission.tas } /></li>

            </ul>
          </div>
        </div>

      </div>
    </div>
  );
};

/* ===== EXPORTS ===== */
export default InsertPopup;