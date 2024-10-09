/* ===== IMPORTS ===== */
import { AppDataContext } from "../../utils/Contexts.js";
import { useContext } from "react";
import { Link } from "react-router-dom";
import FancyLevel from "../FancyLevel/FancyLevel.jsx";
import FrontendHelper from "../../helper/FrontendHelper.js";
import Username from "../../components/Username/Username.jsx";

function RecentSubmissionsRow({ submission, renderGame, renderLevelContext }) {
  /* ===== CONTEXTS ===== */

  // appData state from app data context
  const { appData } = useContext(AppDataContext);
  
  /* ===== VARIABLES ===== */
  const level = submission.level;
  const category = level.category;
  const game = submission.level.mode.game;
  const type = submission.score ? "score" : "time";
  const profile = submission.profile;
  const version = submission.version;
  const { name: categoryName } = appData.categories[category];
  let gameUrl = `/games/${ game.abb }`;
  let gameName = game.name;
  if (version) {
    gameUrl += `?version=${ version.version }`;
    gameName += ` (${ version.version })`;
  }

  /* ===== FUNCTIONS ===== */

  // helper functions
  const { capitalize, getTimeAgo, recordB2F } = FrontendHelper();

  /* ===== RECENT SUBMISSION ROW COMPONENT ===== */
  return (
    <tr>
      <td>{ getTimeAgo(submission.id) }</td>
      <td><Username profile={ profile } /></td>
      { renderGame && 
        <td>
          <Link to={ gameUrl }>
            { gameName }
          </Link>
        </td> 
      }
      { renderLevelContext &&
        <>
          <td>{ categoryName }</td>
          <td>
            <Link to={ `/games/${ game.abb }/${ category }/${ type }/${ level.name }` }>
              <FancyLevel level={ level.name } /> ({ capitalize(type) })
            </Link>
          </td>
        </>
        
      }
      <td>{ recordB2F(submission.record, type, level.timer_type) }</td>
      <td>{ submission.tas && "TAS" }</td>
    </tr>
  );
};

/* ===== EXPORTS ====== */
export default RecentSubmissionsRow;