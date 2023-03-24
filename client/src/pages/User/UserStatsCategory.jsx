/* ===== IMPORTS ===== */
import "./User.css";
import { Link } from "react-router-dom";
import FrontendHelper from "../../helper/FrontendHelper";

function UserStatsCategory({ game, category }) {
  /* ===== FUNCTIONS ===== */
  
  // helper functions
  const { capitalize } = FrontendHelper();

  /* ===== USER STATS CATEGORY COMPONENT ===== */
  return (
    <div className="user-stats-category">
      <h2>{ capitalize(category) }</h2>
      <Link className="user-stats-link" to={ `${ game.abb }/${ category }/score` }>Score</Link>
      <Link className="user-stats-link" to={ `${ game.abb }/${ category }/time` }>Time</Link>
    </div>
  );
};

/* ===== EXPORTS ===== */
export default UserStatsCategory;