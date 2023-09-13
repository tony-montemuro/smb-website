/* ===== IMPORTS ===== */
import "./Notifications.css";
import CheckmarkOrX from "./CheckmarkOrX";
import FrontendHelper from "../../helper/FrontendHelper";
import NotificationBasicInfo from "./NotificationBasicInfo";
import Username from "../../components/Username/Username.jsx";

function ApprovePopup({ notifications, dispatchNotifications }) {
  /* ===== VARIABLES ===== */
  const notification = notifications.current;
  const type = notification.score ? "score" : "time";

  /* ===== FUNCTIONS ===== */

  // helper functions
  const { capitalize, recordB2F } = FrontendHelper()

  /* ===== APPROVE POPUP COMPONENT ===== */
  return (
    <div className="notifications-popup">
      <div className="notifications-popup-inner">

        { /* Button to exit the popup */ }
        <button type="button" onClick={ () => dispatchNotifications({ field: "current", payload: null }) }>Close</button>

        { /* Popup header - includes a link to the moderator's user page */ }
        <h2>
          <Username profile={ notification.creator } />
          &nbsp;has approved the following submission: 
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

              { /* Render whether or not the submission used TAS */ }
              <li>TAS: <CheckmarkOrX isChecked={ notification.tas } /></li>

            </ul>
          </div>
        </div>

      </div>
    </div>
  );
};

/* ===== EXPORTS ===== */
export default ApprovePopup;