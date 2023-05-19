/* ===== IMPORTS ===== */
import { Link } from "react-router-dom";
import FrontendHelper from "../../helper/FrontendHelper";
import NotificationBasicInfo from "./NotificationBasicInfo";
import NotificationMessage from "./NotificationMessage";

function UpdatePopup({ notifications, setNotifications }) {
  /* ===== VARIABLES ===== */
  const notification = notifications.current;
  const type = notification.score ? "score" : "time";

  /* ===== FUNCTIONS ===== */
  const { capitalize, recordB2F, dateB2F } = FrontendHelper();

  /* ===== UPDATE POPUP COMPONENT ===== */
  return (
    <div className="notifications-popup">
      <div className="notifications-popup-inner">

        { /* Button to exit the popup */ }
        <button onClick={ () => setNotifications({ ...notifications, current: null }) }>Close</button>

        { /* Popup header - includes a link to the moderator's user page */ }
        <h2>
          <Link to={`/user/${ notification.creator.id }`}>{ notification.creator.username }</Link> has updated the following submission: 
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

            { /* Render the submission date. If the submission date was updated, render both the old submission date, and the new
            submission date. */ }
            { notification.submitted_at !== notification.submission.submitted_at ?
              <div className="notifications-updated">
                <li>
                  Date: { dateB2F(notification.submitted_at) } → { dateB2F(notification.submission.submitted_at) }
                </li>
              </div>
            :
              <li>
                Date: { dateB2F(notification.submitted_at) }
              </li>
            }

            { /* Render the submission region. If the submission region was updated, render both the old region, and the new region. */ }
            { notification.region.id !== notification.submission.region.id ?
              <div className="notifications-updated">
                <li>
                  Region: { notification.region.region_name } → { notification.submission.region.region_name }
                </li>
              </div>
            :
              <li>
                Region: { notification.region.region_name }
              </li>
            }

            { /* Render the submission monkey. If the submission monkey was updated, render both the old monkey, and the new monkey. */ }
            { notification.monkey.id !== notification.submission.monkey.id ?
              <div className="notifications-updated">
                <li>
                  Monkey: { notification.monkey.monkey_name } → { notification.submission.monkey.monkey_name }
                </li>
              </div>
            :
              <li>
                Monkey: { notification.monkey.monkey_name }
              </li>
            }

            { /* Render the submission proof. If the submission proof was updated, render both the old proof, and the new proof. */ }
            { notification.proof !== notification.submission.proof ?
              <div className="notifications-updated">
                <li>
                  Proof:&nbsp;
                  <a href={ notification.proof } target="_blank" rel="noopener noreferrer">Old</a>
                  &nbsp;→&nbsp;
                  <a href={ notification.submission.proof } target="_blank" rel="noopener noreferrer">New</a>
                </li>
              </div>
            :
              <li>
                Proof: <a href={ notification.proof } target="_blank" rel="noopener noreferrer">☑️</a>
              </li>
            }

            { /* Render the submission comment. If the submission comment was updated, render both the old comment, and the new comment. */ }
            { notification.comment !== notification.submission.comment ?
              <div className="notifications-updated">
                <li>
                  Comment:&nbsp;
                  { notification.comment ? notification.comment : <i>None</i> } 
                  &nbsp;→&nbsp;
                  { notification.submission.comment ? notification.submission.comment : <i>None</i> }
                </li>
              </div>
            :
              <li>
                Comment: { notification.comment ? notification.comment : <i>None</i> }
              </li>
            }

            { /* Render the submission live status. If the submission live status was updated, render both the old status, and 
            the new status. */ }
            { notification.live !== notification.submission.live ?
              <div className="notifications-updated">
                <li>
                  Live Status: { notification.live ? "Live" : "Not Live" } → { notification.submission.live ? "Live" : "Not Live" }
                </li>
              </div>
            :
              <li>
                Live Status: { notification.live ? "Live" : "Not Live" }
              </li>
            }

          </ul>
        </div>

        { /* Render the message associated with the submission, if there is one. */ }
        <NotificationMessage message={ notification.message } notification={ notification } />

      </div>
    </div>
  );
};

/* ===== EXPORTS ===== */
export default UpdatePopup;