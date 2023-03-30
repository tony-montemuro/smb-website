/* ===== IMPORTS ===== */
import "./Notifications.css";
import { Link } from "react-router-dom";
import { useContext } from "react";
import { UserContext } from "../../Contexts";
import FrontendHelper from "../../helper/FrontendHelper";
import NotificationBasicInfo from "./NotificationBasicInfo";
import NotificationMessage from "./NotificationMessage";
import NotificationProof from "./NotificationProof";

function ReportPopup({ notifications, setNotifications }) {
  /* ===== VARIABLES ===== */
  const notification = notifications.current;
  const type = notification.score ? "score" : "time";

  /* ===== CONTEXTS ===== */

  // user state from user context
  const { user } = useContext(UserContext);

  /* ===== FUNCTIONS ===== */

  // helper functions
  const { capitalize, dateB2F, recordB2F } = FrontendHelper();

  /* ===== REPORT POPUP COMPONENT ===== */
  return (
    <div className="notifications-popup">
      <div className="notifications-popup-inner">

        { /* Button to exit the popup */ }
        <button onClick={ () => setNotifications({ ...notifications, current: null }) }>Close</button>

        { /* Popup header - includes a link to the reporter's user page */ }
        <h2>
          <Link to={ `/user/${ notification.creator.id }` }>{ notification.creator.username }</Link> has reported { user.id === notification.submission.user.id ? "your" : "the following" } submission:
        </h2>

        { /* Notification details */ }
        <div className="notification-details">
          <ul>

            { /* Render the owner of the reported submission. If the report is for the current user, we do not need to render. */ }
            { user.id !== notification.submission.user.id && 
              <li>User: <Link to={ `/user/${ notification.submission.user.id }`}>{ notification.submission.user.username }</Link></li>
            }

            { /* Render basic information about submission - includes the game, as well as level */ }
            <NotificationBasicInfo notification={ notification } />

            {/* Render the record */}
            <li>{ capitalize(type) }: { recordB2F(notification.record, type) }</li>

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

        { /* Render a disclaimer message about reports. Only render if the reported submission belongs to the current user. */ }
        { user.id === notification.submission.user.id && 
          <>
            <p><b>Note: </b><i>It is suggested that you ensure all properties of your submission are valid. If you are confident
            your submission is fine, do not worry. If not, a moderator may be forced to delete your submission!</i></p>
            <p><i>If a moderator falsely deletes any of your submissions, please contact the moderation team.</i></p>
          </>
        }
        
      </div>
  </div>
);
};

/* ===== EXPORTS ===== */
export default ReportPopup;