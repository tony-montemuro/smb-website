/* ===== IMPORTS ===== */
import "./Notifications.css";
import { Link } from "react-router-dom";
import { useContext } from "react";
import { UserContext } from "../../Contexts";
import FrontendHelper from "../../helper/FrontendHelper";
import NotificationBasicInfo from "./NotificationBasicInfo";
import NotificationMessage from "./NotificationMessage";
import NotificationProof from "./NotificationProof";
import Username from "../../components/Username/Username";
import LiveSymbol from "./LiveSymbol";

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
          <Username country={ notification.creator.country } profileId={ notification.creator.id } username={ notification.creator.username } />
          &nbsp;has reported { user.id === notification.submission.profile.id ? "your" : "the following" } submission:
        </h2>

        { /* Notification details */ }
        <div className="notifications-details-wrapper">
          <div className="notifications-details">
            
            <ul>

              { /* Render the owner of the reported submission. If the report is for the current user, we do not need to render. */ }
              { user.profile.id !== notification.submission.profile.id && 
                <li>User:&nbsp;<Link to={ `/user/${ notification.submission.profile.id }`}>{ notification.submission.profile.username }</Link></li>
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
              <li><NotificationProof proof={ notification.submission.proof } /></li>

              { /* Render whether or not the submission was live */ }
              <li>Live Proof: <LiveSymbol liveStatus={ notification.submission.live } /></li>

            </ul>
          </div>
        </div>

        { /* Render the message associated with the submission, if there is one. */ }
        <NotificationMessage message={ notification.message } notification={ notification } />

        { /* Render a disclaimer message about reports. Only render if the reported submission belongs to the current user. */ }
        { user.profile.id === notification.submission.profile.id && 
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