/* ===== IMPORTS ===== */
import { useNavigate } from "react-router-dom";
import FrontendHelper from "../../helper/FrontendHelper";
import GameHelper from "../../helper/GameHelper";

function UserStatsCategory({ game, category }) {
  /* ===== HELPER FUNCTIONS ===== */
  
  // helper functions
  const { categoryB2F, capitalize } = FrontendHelper();
  const { getCategoryTypes } = GameHelper();

  /* ===== VARIABLES ===== */
  const types = getCategoryTypes(game, category);
  const navigate = useNavigate();

  /* ===== USER STATS CATEGORY COMPONENT ===== */
  return (
    <div className="user-layout-category">

      { /* First, render the name of the category */ }
      <h3>{ categoryB2F(category) }</h3>

      { /* Then, for each type in the category, render a button to navigate to the user's stats for { game.abb }, category, type */ }
      <div className="user-layout-category-links">
        { types.map(type => {
          return ( 
            <button 
              onClick={ () => navigate(`${ game.abb }/${ category }/${ type }`) }
              key={ type }
            >
              { capitalize(type) }
            </button>
          );
        })}
      </div>

    </div>
  );
};

/* ===== EXPORTS ===== */
export default UserStatsCategory;