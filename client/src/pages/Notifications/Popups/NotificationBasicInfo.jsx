/* ===== IMPORTS ===== */
import { AppDataContext } from "../../../utils/Contexts.js";
import { Link } from "react-router-dom";
import { useContext } from "react";
import FancyLevel from "../../../components/FancyLevel/FancyLevel.jsx";
import FrontendHelper from "../../../helper/FrontendHelper";

function NotificationBasicInfo({ notification }) {
  /* ===== CONTEXTS ===== */

  // appData state from app data context
  const { appData } = useContext(AppDataContext);

  /* ===== VARIABLES ===== */
  const category = notification.level.category;
  const { name: categoryName } = appData.categories[category];
  
  /* ===== FUNCTIONS ===== */

  // helper functions
  const { capitalize } = FrontendHelper();

  /* ===== NOTIFICATION BASIC INFO COMPONENT ===== */
  return ( 
    <>
      <li>
        Game:&nbsp;<Link to={`/games/${ notification.level.mode.game.abb }`}>{ notification.level.mode.game.name }</Link> 
      </li>
      <li>
        Category: { categoryName }
      </li>
      <li>
        Chart:&nbsp;
        <Link to={`/games/${ notification.level.mode.game.abb }/${ category }/${ notification.score ? "score" : "time" }/${ notification.level.name }`}>
          <div><FancyLevel level={ notification.level.name } />&nbsp;({ capitalize(notification.score ? "score" : "time") })</div>
        </Link>
      </li>
    </>
  );
};

/* ===== EXPORTS ===== */
export default NotificationBasicInfo;