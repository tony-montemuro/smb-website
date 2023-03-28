/* ===== IMPORTS ===== */
import "./Notifications.css";
import { Link } from "react-router-dom";
import FrontendHelper from "../../helper/FrontendHelper";
import NotificationBasicInfo from "./NotificationBasicInfo";
import NotificationMessage from "./NotificationMessage";
import NotificationProof from "./NotificationProof";

function InsertPopup({ notifications, setNotifications }) {
  /* ===== VARIABLES ===== */
  const notification = notifications.current;
  const type = notification.score ? "score" : "time";

  /* ===== FUNCTIONS ===== */

  // helper functions
  const { capitalize, dateB2F, recordB2F } = FrontendHelper();

  /* ===== INSERT NOTIFICATION POPUP ===== */
  return (
    <div className="notifications-popup">
      <div className="notifications-popup-inner">

        { /* Button to exit the popup */ }
        <button onClick={ () => setNotifications({ ...notifications, current: null }) }>Close</button>

        { /* Popup header - includes a link to the moderator's user page */ }
        <h2>
          <Link to={`/user/${ notification.creator.id }`}>{ notification.creator.username }</Link> has submitted the following submission on your behalf: 
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
            
            { /* Render the submission date */ }
            <li>Date: { dateB2F(notification.submission.submitted_at) }</li>

            { /* Render the region of the submission */ }
            <li>Region: { notification.submission.region.region_name }</li>

            { /* Render the monkey used in the submission */ }
            <li>Monkey: { notification.submission.monkey.monkey_name }</li>

            { /* Render the proof of the submission */ }
            <li>Proof: <NotificationProof proof={ notification.submission.proof } /></li>

            { /* Render whether or not the submission was live */ }
            <li>Live: { notification.submission.live ? "Yes" : "No" }</li>

          </ul>
        </div>

        { /* Render the message associated with the submission, if there is one. */ }
        <NotificationMessage message={ notification.message } notification={ notification } />

      </div>
    </div>
  );
};

/* ===== EXPORTS ===== */
export default InsertPopup;