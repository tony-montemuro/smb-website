/* ===== IMPORTS ===== */
import { GameContext } from "../../Contexts";
import { Link } from "react-router-dom";
import { useContext } from "react";
import FrontendHelper from "../../helper/FrontendHelper";
import Username from "../../components/Username/Username";

function RecentGameSubmissionRow({ submission }) {
  /* ===== VARIABLES ===== */
  const level = submission.level;
  const category = level.misc ? "misc" : "main";
  const type = submission.score ? "score" : "time";
  const profile = submission.profile;
  
  /* ===== CONTEXTS ===== */

  // game state from game context
  const { game } = useContext(GameContext);

  /* ===== FUNCTIONS ====== */
  const { capitalize, cleanLevelName, getTimeAgo } = FrontendHelper();

  /* ===== RECENT GAME SUBMISSION ROW COMPONENT ===== */
  return (
    <tr>
      <td>{ getTimeAgo(submission.id) }</td>
      <td><Username country={ profile.country } profileId={ profile.id } username={ profile.username } /></td>
      <td><Link to={ `/games/${ game.abb }/${ category }/${ type }/${ level.name }` }>{ cleanLevelName(level.name) }</Link></td>
      <td>{ capitalize(type) }</td>
      <td>{ submission.record }</td>
      <td>{ submission.all_position }</td>
    </tr>
  );
};

/* ===== EXPORTS ===== */
export default RecentGameSubmissionRow;