/* ===== IMPORTS ===== */
import { Link } from "react-router-dom";
import FancyLevel from "../../../components/FancyLevel/FancyLevel.jsx";
import FrontendHelper from "../../../helper/FrontendHelper";

function NotificationBasicInfo({ notification }) {
  /* ===== FUNCTIONS ===== */

  // helper functions
  const { capitalize, categoryB2F } = FrontendHelper();

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
          <div><FancyLevel level={ notification.level.name } />&nbsp;({ capitalize(notification.score ? "score" : "time") })</div>
        </Link>
      </li>
    </>
  );
};

/* ===== EXPORTS ===== */
export default NotificationBasicInfo;