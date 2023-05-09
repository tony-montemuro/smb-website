/* ===== IMPORTS ===== */
import { Link } from "react-router-dom";
import FrontendHelper from "../../helper/FrontendHelper.js";
import Username from "../../components/Username/Username.jsx";

function RecentSubmissionsRow({ submission, renderGame }) {
  /* ===== VARIABLES ===== */
  const level = submission.level;
  const category = level.misc ? "misc" : "main";
  const game = submission.level.mode.game;
  const type = submission.score ? "score" : "time";
  const user = submission.user;

  /* ===== FUNCTIONS ===== */

  // helper functions
  const { cleanLevelName, capitalize, getTimeDifference } = FrontendHelper();

  /* ===== RECENT SUBMISSION ROW COMPONENT ===== */
  return (
    <tr>
      <td>{ getTimeDifference(submission.id) }</td>
      <td><Username country={ user.country } userId={ user.id } username={ user.username } /></td>
      { renderGame && <td><Link to={ `/games/${ game.abb }` }>{ game.name }</Link></td> }
      <td><Link to={ `/games/${ game.abb }/${ category }/${ type }/${ level.name }` }>{ cleanLevelName(level.name) }</Link></td>
      <td>{ capitalize(type) }</td>
      <td>{ submission.record }</td>
      <td>{ submission.all_position }</td>
    </tr>
  );
};

/* ===== EXPORTS ====== */
export default RecentSubmissionsRow;