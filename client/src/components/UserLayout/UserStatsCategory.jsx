/* ===== IMPORTS ===== */
import { Link, useParams } from "react-router-dom";
import FrontendHelper from "../../helper/FrontendHelper";

function UserStatsCategory({ game, category }) {
  /* ===== VARIABLES ===== */
  const params = useParams();
  const { profileId } = params;

  /* ===== FUNCTIONS ===== */
  
  // helper functions
  const { categoryB2F } = FrontendHelper();

  /* ===== USER STATS CATEGORY COMPONENT ===== */
  return (
    <div className="user-layout-category">
      <h2>{ categoryB2F(category) }</h2>
      <Link className="user-stats-link" to={ `/user/${ profileId }/${ game.abb }/${ category }/score` }>Score</Link>
      <Link className="user-stats-link" to={ `/user/${ profileId }/${ game.abb }/${ category }/time` }>Time</Link>
    </div>
  );
};

/* ===== EXPORTS ===== */
export default UserStatsCategory;