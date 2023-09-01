/* ===== IMPORTS ===== */
import "./Notifications.css";
import CheckmarkOrX from "./CheckmarkOrX";
import FrontendHelper from "../../helper/FrontendHelper";
import NotificationBasicInfo from "./NotificationBasicInfo";
import NotificationMessage from "./NotificationMessage";
import Username from "../../components/Username/Username";

function DeletePopup({ notifications, setNotifications }) {
  /* ===== VARIABLES ===== */
  const notification = notifications.current;
  const type = notification.score ? "score" : "time";

  /* ===== FUNCTIONS ===== */

  // helper functions
  const { capitalize, recordB2F } = FrontendHelper();

  /* ===== DELETE POPUP COMPONENT ===== */
  return (
    <div className="notifications-popup">
      <div className="notifications-popup-inner">

        { /* Button to exit the popup */ }
        <button type="button" onClick={ () => setNotifications({ ...notifications, current: null }) }>Close</button>

        { /* Popup header - includes a link to the moderator's user page */ }
        <h2>
          <Username country={ notification.creator.country } profileId={ notification.creator.id } username={ notification.creator.username } />
          &nbsp;has removed the following submission: 
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

        { /* Render the message associated with the submission, if there is one. */ }
        <NotificationMessage message={ notification.message } notification={ notification } />

      </div>
    </div>
  );
};

/* ===== EXPORTS ===== */
export default DeletePopup;