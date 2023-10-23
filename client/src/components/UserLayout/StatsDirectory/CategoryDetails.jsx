/* ===== IMPORTS ===== */
import styles from "./StatsDirectory.module.css";
import FrontendHelper from "../../../helper/FrontendHelper";
import GameHelper from "../../../helper/GameHelper";
import StylesHelper from "../../../helper/StylesHelper";
import UserLayoutLogic from "../UserLayout.js";

function CategoryDetails({ game, category, index }) {
  /* ===== FUNCTIONS ===== */

  // functions from the js file
  const { onStatsClick } = UserLayoutLogic();

  // helper functions
  const { capitalize, categoryB2F } = FrontendHelper();
  const { getCategoryTypes } = GameHelper();
  const { indexToParity } = StylesHelper();

  /* ===== VARIABLES ===== */
  const types = getCategoryTypes(game, category);

  /* ===== CATEGORY DETAILS COMPONENT ===== */
  return (
    <div className={ `${ styles.category } ${ indexToParity(index) }` }>

      { /* First, render the name of the category */ }
      <h3>{ categoryB2F(category) }</h3>

      { /* Then, for each type in the category, render a button to navigate to the user's stats for { game.abb }, category, type */ }
      <div className={ styles.links }>
        { types.map(type => {
          return ( 
            <button 
              type="button"
              onClick={ () => onStatsClick(game.abb, category, type) }
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
export default CategoryDetails;