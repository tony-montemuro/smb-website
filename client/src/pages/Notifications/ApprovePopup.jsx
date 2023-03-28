/* ===== IMPORTS ===== */
import "./Notifications.css";
import { Link } from "react-router-dom";
import FrontendHelper from "../../helper/FrontendHelper";
import NotificationBasicInfo from "./NotificationBasicInfo";

function ApprovePopup({ notifications, setNotifications }) {
  /* ===== VARIABLES ===== */
  const notification = notifications.current;
  const type = notification.score ? "score" : "time";

  /* ===== FUNCTIONS ===== */

  // helper functions
  const { capitalize, dateB2F, recordB2F } = FrontendHelper()

  /* ===== APPROVE POPUP COMPONENT ===== */
  return (
    <div className="notifications-popup">
      <div className="notifications-popup-inner">

        { /* Button to exit the popup */ }
        <button onClick={ () => setNotifications({ ...notifications, current: null }) }>Close</button>

        { /* Popup header - includes a link to the moderator's user page */ }
        <h2>
          <Link to={`/user/${ notification.creator.id }`}>{ notification.creator.username }</Link> has approved the following submission: 
        </h2>

        { /* Notification details */ }
        <div className="notification-details">
          <ul>

            { /* Render basic information about submission - includes the game, as well as level */ }
            <NotificationBasicInfo notification={ notification } />

            { /* Render the record */ }
            <li>
              { capitalize(type) }: { recordB2F(notification.record, type) }
            </li>
            
            { /* Render the submission approval date */ }
            <li>Approval Date: { dateB2F(notification.notif_date) }</li>

          </ul>
        </div>

      </div>
    </div>
  );
};

/* ===== EXPORTS ===== */
export default ApprovePopup;