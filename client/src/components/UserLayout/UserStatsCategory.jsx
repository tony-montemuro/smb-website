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
      <h3>{ categoryB2F(category) }</h3>
      <Link to={ `/user/${ profileId }/${ game.abb }/${ category }/score` }>Score</Link>
      <Link to={ `/user/${ profileId }/${ game.abb }/${ category }/time` }>Time</Link>
    </div>
  );
};

/* ===== EXPORTS ===== */
export default UserStatsCategory;