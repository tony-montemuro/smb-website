/* ===== IMPORTS ===== */
import { AppDataContext, PopupContext } from "../../../utils/Contexts";
import { useContext } from "react";
import { Link } from "react-router-dom";
import styles from "./Popups.module.css";
import ClearIcon from "@mui/icons-material/Clear";
import CheckmarkOrX from "./CheckmarkOrX";
import FancyLevel from "../../../components/FancyLevel/FancyLevel.jsx";
import FrontendHelper from "../../../helper/FrontendHelper";
import NotificationProof from "./NotificationProof";
import Username from "../../../components/Username/Username";
import VideocamIcon from "@mui/icons-material/Videocam";

function Update() {
  /* ===== CONTEXTS ===== */

  // appData state from app data context
  const { appData } = useContext(AppDataContext);

  // popup data state from popup context
  const { popupData } = useContext(PopupContext);

  /* ===== VARIABLES ===== */
  const notification = popupData;
  const submission = notification.submission;
  const type = notification.score ? "score" : "time";
  const category = notification.level.category;
  const { name: categoryName } = appData.categories[category];
  const game = notification.level.mode.game;
  const version = submission.version;
  let gameUrl = `/games/${ game.abb }`;
  let gameName = game.name;
  let chartUrl = `/games/${ game.abb }/${ category }/${ notification.score ? "score" : "time" }/${ notification.level.name }`;
  if (game.version.length > 0 && submission.version) {
    const versionSearchParam = `?version=${ version.version }`;
    gameUrl += versionSearchParam;
    gameName += ` (${ version.version })`;
    chartUrl += versionSearchParam;
  }

  /* ===== FUNCTIONS ===== */
  const { capitalize, recordB2F, dateB2F } = FrontendHelper();

  /* ===== UPDATE POPUP COMPONENT ===== */
  return (
    <div className={ styles.popup }>

      { /* Popup header - includes a link to the moderator's user page */ }
      <h2>
        <Username profile={ notification.creator } />
        &nbsp;has updated the following submission: 
      </h2>

      { /* Notification details */ }
      <div className={ styles.details }>
        <ul>

          { /* Link to the game corresponding to the notification prop */ }
          <li>
            <span className={ styles.wrapper }>
              Game:&nbsp;<Link to={ gameUrl }>{ gameName }</Link> 
            </span>
          </li>

          { /* Link to the category of the level corresponding to the notification prop */ }
          <li>
            <span className={ styles.wrapper }>
              Category: { categoryName }
            </span>
          </li>

          { /* Link to the level corresponding to the notification prop */ }
          <li>
            <span className={ styles.wrapper }>
              Chart:&nbsp;
              <Link to={ chartUrl }>
                <div><FancyLevel level={ notification.level.name } />&nbsp;({ capitalize(notification.score ? "score" : "time") })</div>
              </Link>
            </span>
          </li>

          { /* Render the record */ }
          <li>
            <span className={ styles.wrapper }>{ capitalize(type) }: { recordB2F(notification.record, type, notification.level.timer_type) }</span>
          </li>

          { /* Render version, if game has any, ONLY if version has changed */ }
          { game.version.length > 0 && notification.version.id !== submission.version.id &&
            <li>
              <div className={ styles.updated }>
                <span className={ styles.wrapper }>
                  Game Version: { notification.version.version } → { submission.version.version }
                </span>
              </div>
            </li>
          }

          { /* Render the submission date. If the submission date was updated, render both the old submission date, and the new
          submission date. */ }
          { notification.submitted_at !== submission.submitted_at ?
            <li>
              <div className={ styles.updated }>
                <span className={ styles.wrapper }>
                  Date: { dateB2F(notification.submitted_at) } → { dateB2F(submission.submitted_at) }
                </span>
              </div>
            </li>
          :
            <li>
              <span className={ styles.wrapper }>Date: { dateB2F(notification.submitted_at) }</span>
            </li>
          }

          { /* Render the submission monkey. If the submission monkey was updated, render both the old monkey, and the new monkey. */ }
          { notification.monkey.id !== submission.monkey.id ?
            <li>
              <div className={ styles.updated }>
                <span className={ styles.wrapper }>
                  Monkey: { notification.monkey.monkey_name } → { submission.monkey.monkey_name }
                </span>
              </div>
            </li>
          :
            <li>
              <span className={ styles.wrapper }>Monkey: { notification.monkey.monkey_name }</span>
            </li>
          }

          { /* Render the submission platform. If the submission platform was updated, render both the old platform,
          and the new platform. */ }
          { notification.platform.id !== submission.platform.id ?
            <li>
              <div className={ styles.updated }>
                <span className={ styles.wrapper }>
                  Platform: { notification.platform.platform_name } → { submission.platform.platform_name }
                </span>
              </div>
            </li>
          :
            <li>
              <span className={ styles.wrapper }>Platform: { notification.platform.platform_name }</span>
            </li>
          }

          { /* Render the submission region. If the submission region was updated, render both the old region, and the new region. */ }
          { notification.region.id !== submission.region.id ?
            <li>
              <div className={ styles.updated }>
                <span className={ styles.wrapper }>
                  Region: { notification.region.region_name } → { submission.region.region_name }
                </span>
              </div>
            </li>
          :
            <li>
              <span className={ styles.wrapper }>Region: { notification.region.region_name }</span>
            </li>
          }

          { /* Render the submission proof. If the submission proof was updated, render both the old proof, and the new proof. */ }
          { notification.proof !== submission.proof ?
            <li>
              <div className={ styles.updated }>
                <span className={ styles.wrapper }>
                  Proof:&nbsp;
                  { notification.proof ?
                    <a href={ notification.proof } target="_blank" rel="noopener noreferrer">
                      <VideocamIcon sx={{ color: "white" }} titleAccess={ notification.proof } />
                    </a>
                  :
                    <ClearIcon />
                  }
                  &nbsp;→&nbsp;
                  <a href={ submission.proof } target="_blank" rel="noopener noreferrer">
                    <VideocamIcon sx={{ color: "white" }} titleAccess={ submission.proof } />
                  </a>
                </span>
              </div>
            </li>
          :
            <li>
              <span className={ styles.wrapper }>
                <NotificationProof proof={ submission.proof } />
              </span>
            </li>
          }

          { /* Render the submission live proof status. If the submission live status was updated, render both the old status, and 
          the new status. */ }
          { notification.live !== submission.live ?
            <li>
              <div className={ styles.updated }>
                <span className={ styles.wrapper }>
                  Live Proof: <CheckmarkOrX isChecked={ notification.live } /> → <CheckmarkOrX isChecked={ submission.live } />
                </span>
              </div>
            </li>          
          :
            <li>
              <span className={ styles.wrapper }>Live Status: <CheckmarkOrX isChecked={ submission.live } /></span>
            </li>
          }

          { /* Render if the submission used tools. If the tas field was updated, render both the old tas, and 
          new tas value. */ }
          { notification.tas !== submission.tas ?
            <li>
              <div className={ styles.updated }>
                <span className={ styles.wrapper }>
                  TAS: <CheckmarkOrX isChecked={ notification.tas } /> → <CheckmarkOrX isChecked={ submission.tas } />
                </span>
              </div>
            </li>
          :
            <li>
              <span className={ styles.wrapper }>TAS: <CheckmarkOrX isChecked={ submission.tas } /></span>
            </li>
          }

          { /* Render the submission comment. If the submission comment was updated, render both the old comment, and the new comment. */ }
          { notification.comment !== submission.comment ?
            <li>
              <div className={ styles.updated }>
                <span className={ styles.wrapper }>
                  Comment:&nbsp;
                  { notification.comment ? `"${ notification.comment }"` : `""` } 
                  &nbsp;→&nbsp;
                  { submission.comment ? `"${ submission.comment }"` : `""` }
                </span>
              </div>
            </li>
          :
            <li>
              <span className={ styles.wrapper }>Comment:&nbsp;{ notification.comment ? `"${ notification.comment }"` : `""` }</span>
            </li>
          }

          { /* Render the moderator note. If the moderator note was updated, render both the old mod note, and the new mod note. */ }
          { notification.mod_note !== submission.mod_note ?
            <li>
              <div className={ styles.updated }>
                <span className={ styles.wrapper }>
                  Moderator Note:&nbsp;
                  { notification.mod_note ? `"${ notification.mod_note }"` : `""` }
                  &nbsp;→&nbsp;
                  { submission.mod_note ? `"${ submission.mod_note }"` : `""` }
                </span>
              </div>
            </li>
          :
            <li>
              <span className={ styles.wrapper }>Moderator Note:&nbsp;{ notification.mod_note ? `"${ notification.mod_note }"` : `""` }</span>
            </li>
          }

        </ul>
      </div>

    </div>
  );
};

/* ===== EXPORTS ===== */
export default Update;