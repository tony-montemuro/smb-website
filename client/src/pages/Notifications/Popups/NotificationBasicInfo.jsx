/* ===== IMPORTS ===== */
import { Link } from "react-router-dom";
import FrontendHelper from "../../../helper/FrontendHelper";

function NotificationBasicInfo({ notification }) {
  /* ===== FUNCTIONS ===== */

  // helper functions
  const { capitalize, cleanLevelName, categoryB2F } = FrontendHelper();

  /* ===== NOTIFICATION BASIC INFO COMPONENT ===== */
  return ( 
    <>
      <li>
        Game:&nbsp;<Link to={`/games/${ notification.level.mode.game.abb }`}>{ notification.level.mode.game.name }</Link> 
      </li>
      <li>
        Category: { categoryB2F(notification.level.category) }
      </li>
      <li>
        Chart:&nbsp;
        <Link to={`/games/${ notification.level.mode.game.abb }/${ notification.level.category }/${ notification.score ? "score" : "time" }/${ notification.level.name }`}>
          { cleanLevelName(notification.level.name) } ({ capitalize(notification.score ? "score" : "time") })
        </Link>
      </li>
    </>
  );
};

/* ===== EXPORTS ===== */
export default NotificationBasicInfo;