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
  const game = notification.level.mode.game;
  const category = notification.level.category;
  const { name: categoryName } = appData.categories[category];
  const submission = notification.submission;
  const version = submission ? submission.version : notification.version;
  
  let gameUrl = `/games/${ game.abb }`;
  let gameName = game.name;
  let chartUrl = `/games/${ game.abb }/${ category }/${ notification.score ? "score" : "time" }/${ notification.level.name }`;
  if (game.version.length > 0 && version) {
    const versionSearchParam = `?version=${ version.version }`;
    gameUrl += versionSearchParam;
    gameName += ` (${ version.version })`;
    chartUrl += versionSearchParam;
  }
  
  /* ===== FUNCTIONS ===== */

  // helper functions
  const { capitalize } = FrontendHelper();

  /* ===== NOTIFICATION BASIC INFO COMPONENT ===== */
  return ( 
    <>
      <li>
        Game:&nbsp;<Link to={ gameUrl }>{ `${ gameName }` }</Link> 
      </li>
      <li>
        Category: { categoryName }
      </li>
      <li>
        Chart:&nbsp;
        <Link to={ chartUrl }>
          <div><FancyLevel level={ notification.level.name } />&nbsp;({ capitalize(notification.score ? "score" : "time") })</div>
        </Link>
      </li>
    </>
  );
};

/* ===== EXPORTS ===== */
export default NotificationBasicInfo;