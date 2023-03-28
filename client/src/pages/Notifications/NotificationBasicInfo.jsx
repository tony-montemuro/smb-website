/* ===== IMPORTS ===== */
import "./Notifications.css";
import { Link } from "react-router-dom";
import FrontendHelper from "../../helper/FrontendHelper";

function NotificationBasicInfo({ notification }) {
  /* ===== FUNCTIONS ===== */

  // helper functions
  const { capitalize, cleanLevelName } = FrontendHelper();

  /* ===== NOTIFICATION BASIC INFO COMPONENT ===== */
  return ( 
    <>

      { /* Link to the game corresponding to the notification prop */ }
      <li>
        Game: <Link to={`/games/${ notification.level.mode.game.abb }`}>{ notification.level.mode.game.name }</Link> 
      </li>

      { /* Link to the level corresponding to the notification prop */ }
      <li>
        Chart: <Link to={`/games/${ notification.level.mode.game.abb }/${ notification.level.misc ? "misc" : "main" }/${ notification.score ? "score" : "time" }/${ notification.level.name }`}>
          { cleanLevelName(notification.level.name) } ({ capitalize(notification.score ? "score" : "time") })
        </Link>
      </li>

    </>
  );
};

/* ===== EXPORTS ===== */
export default NotificationBasicInfo;