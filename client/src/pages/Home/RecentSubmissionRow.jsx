/* ===== IMPORTS ===== */
import { Link } from "react-router-dom";
import HomeLogic from "./Home.js";
import FrontendHelper from "../../helper/FrontendHelper.js";

function RecentSubmissionRow({ submission }) {
  /* ===== VARIABLES ===== */
  const level = submission.level;
  const category = level.misc ? "misc" : "main";
  const game = submission.level.mode.game;
  const type = submission.score ? "score" : "time";
  const user = submission.user;

  /* ===== FUNCTIONS ===== */
  
  // funtions from the Home js file
  const { getTimeDifference } = HomeLogic();

  // helper functions
  const { cleanLevelName, capitalize } = FrontendHelper();

  /* ===== RECENT SUBMISSION ROW COMPONENT ===== */
  return (
    <tr>
      <td>{ getTimeDifference(submission.id) }</td>
      <td>
        <div className="home-user-info">
          { user.country &&
            <div><span className={ `fi fi-${ user.country.toLowerCase() }` }></span></div>
          }
          <div><Link to={ `/user/${ user.id }` }>{ user.username }</Link></div>
        </div>
      </td>
      <td><Link to={ `/games/${ game.abb }` }>{ game.name }</Link></td>
      <td><Link to={ `/games/${ game.abb }/${ category }/${ type }/${ level.name }` }>{ cleanLevelName(level.name) }</Link></td>
      <td>{ capitalize(type) }</td>
      <td>{ submission.record }</td>
      <td>{ submission.all_position }</td>
    </tr>
  );
};

/* ===== EXPORTS ====== */
export default RecentSubmissionRow;