/* ===== IMPORTS ===== */
import { Link } from "react-router-dom";
import ClearIcon from "@mui/icons-material/Clear";
import FrontendHelper from "../../helper/FrontendHelper";
import LiveSymbol from "./LiveSymbol";
import NotificationProof from "./NotificationProof";
import Username from "../../components/Username/Username";
import VideocamIcon from "@mui/icons-material/Videocam";

function UpdatePopup({ notifications, setNotifications }) {
  /* ===== VARIABLES ===== */
  const notification = notifications.current;
  const type = notification.score ? "score" : "time";

  /* ===== FUNCTIONS ===== */
  const { capitalize, cleanLevelName, recordB2F, dateB2F } = FrontendHelper();

  /* ===== UPDATE POPUP COMPONENT ===== */
  return (
    <div className="notifications-popup">
      <div className="notifications-popup-inner">

        { /* Button to exit the popup */ }
        <button type="button" onClick={ () => setNotifications({ ...notifications, current: null }) }>Close</button>

        { /* Popup header - includes a link to the moderator's user page */ }
        <h2>
          <Username country={ notification.creator.country } profileId={ notification.creator.id } username={ notification.creator.username } />
          &nbsp;has updated the following submission: 
        </h2>

        { /* Notification details */ }
        <div className="notifications-details-wrapper">
          <div className="notifications-details">
            <ul>

            { /* Link to the game corresponding to the notification prop */ }
            <li>
              <span>
                Game:&nbsp;<Link to={`/games/${ notification.level.mode.game.abb }`}>{ notification.level.mode.game.name }</Link> 
              </span>
            </li>

            { /* Link to the level corresponding to the notification prop */ }
            <li>
              <span>
                Chart:&nbsp;<Link to={`/games/${ notification.level.mode.game.abb }/${ notification.level.misc ? "misc" : "main" }/${ notification.score ? "score" : "time" }/${ notification.level.name }`}>
                  { cleanLevelName(notification.level.name) } ({ capitalize(notification.score ? "score" : "time") })
                </Link>
              </span>
            </li>

              { /* Render the record */ }
              <li>
                <span>{ capitalize(type) }: { recordB2F(notification.record, type) }</span>
              </li>

              { /* Render the submission date. If the submission date was updated, render both the old submission date, and the new
              submission date. */ }
              { notification.submitted_at !== notification.submission.submitted_at ?
                <li className="notifications-updated">
                  <span>
                    Date: { dateB2F(notification.submitted_at) } → { dateB2F(notification.submission.submitted_at) }
                  </span>
                </li>
              :
                <li>
                  <span>Date: { dateB2F(notification.submitted_at) }</span>
                </li>
              }

              { /* Render the submission region. If the submission region was updated, render both the old region, and the new region. */ }
              { notification.region.id !== notification.submission.region.id ?
                <li className="notifications-updated">
                  <span>
                    Region: { notification.region.region_name } → { notification.submission.region.region_name }
                  </span>
                </li>
              :
                <li>
                  <span>Region: { notification.region.region_name }</span>
                </li>
              }

              { /* Render the submission monkey. If the submission monkey was updated, render both the old monkey, and the new monkey. */ }
              { notification.monkey.id !== notification.submission.monkey.id ?
                <li className="notifications-updated">
                  <span>
                    Monkey: { notification.monkey.monkey_name } → { notification.submission.monkey.monkey_name }
                  </span>
                </li>
              :
                <li>
                  <span>Monkey: { notification.monkey.monkey_name }</span>
                </li>
              }

              { /* Render the submission proof. If the submission proof was updated, render both the old proof, and the new proof. */ }
              { notification.proof !== notification.submission.proof ?
                <li className="notifications-updated">
                  <span>
                    Proof:&nbsp;
                    { notification.proof ?
                      <a href={ notification.proof } target="_blank" rel="noopener noreferrer">
                        <VideocamIcon sx={{ color: "black" }} />
                      </a>
                    :
                      <ClearIcon />
                    }
                    &nbsp;→&nbsp;
                    <a href={ notification.submission.proof } target="_blank" rel="noopener noreferrer">
                      <VideocamIcon sx={{ color: "black" }} />
                    </a>
                  </span>
                </li>
              :
                <li>
                  <span>
                    <NotificationProof proof={ notification.submission.proof } />
                  </span>
                </li>
              }

              { /* Render the submission live proof status. If the submission live status was updated, render both the old status, and 
              the new status. */ }
              { notification.live !== notification.submission.live ?
                <li className="notifications-updated">
                  <span>
                    Live Proof: <LiveSymbol liveStatus={ notification.live } /> → <LiveSymbol liveStatus={ notification.submission.live } />
                  </span>
                </li>          
              :
                <li>
                  <span>Live Status: <LiveSymbol liveStatus={ notification.submission.live } /></span>
                </li>
              }

              { /* Render the submission comment. If the submission comment was updated, render both the old comment, and the new comment. */ }
              { notification.comment !== notification.submission.comment ?
                <li className="notifications-updated">
                  <span>
                    Comment:&nbsp;
                    { notification.comment ? notification.comment : <i>None</i> } 
                    &nbsp;→&nbsp;
                    { notification.submission.comment ? notification.submission.comment : <i>None</i> }
                  </span>
                </li>
              :
                <li>
                  <span>Comment:&nbsp;{ notification.comment ? notification.comment : <i>None</i> }</span>
                </li>
              }

            </ul>
          </div>
        </div>

      </div>
    </div>
  );
};

/* ===== EXPORTS ===== */
export default UpdatePopup;