/* ===== IMPORTS ===== */
import { Link } from "react-router-dom";
import FancyLevel from "../FancyLevel/FancyLevel.jsx";
import FrontendHelper from "../../helper/FrontendHelper.js";
import Username from "../../components/Username/Username.jsx";

function RecentSubmissionsRow({ submission, renderGame, renderLevelContext }) {
  /* ===== VARIABLES ===== */
  const level = submission.level;
  const category = level.category;
  const game = submission.level.mode.game;
  const type = submission.score ? "score" : "time";
  const profile = submission.profile;

  /* ===== FUNCTIONS ===== */

  // helper functions
  const { capitalize, getTimeAgo, categoryB2F, recordB2F } = FrontendHelper();

  /* ===== RECENT SUBMISSION ROW COMPONENT ===== */
  return (
    <tr>
      <td>{ getTimeAgo(submission.id) }</td>
      <td><Username profile={ profile } /></td>
      { renderGame && <td><Link to={ `/games/${ game.abb }` }>{ game.name }</Link></td> }
      { renderLevelContext &&
        <>
          <td>{ categoryB2F(category) }</td>
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