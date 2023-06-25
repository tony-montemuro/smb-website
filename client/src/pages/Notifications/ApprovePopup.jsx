/* ===== IMPORTS ===== */
import "./Notifications.css";
import FrontendHelper from "../../helper/FrontendHelper";
import NotificationBasicInfo from "./NotificationBasicInfo";
import Username from "../../components/Username/Username.jsx";

function ApprovePopup({ notifications, setNotifications }) {
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
        <button type="button" onClick={ () => setNotifications({ ...notifications, current: null }) }>Close</button>

        { /* Popup header - includes a link to the moderator's user page */ }
        <h2>
          <Username country={ notification.creator.country } profileId={ notification.creator.id } username={ notification.creator.username } />
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
                { capitalize(type) }: { recordB2F(notification.record, type) }
              </li>

            </ul>
          </div>
        </div>

      </div>
    </div>
  );
};

/* ===== EXPORTS ===== */
export default ApprovePopup;