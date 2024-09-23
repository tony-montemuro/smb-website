/* ===== IMPORTS ===== */
import { AppDataContext, GameContext } from "../../../utils/Contexts";
import { useContext } from "react";
import styles from "./LevelSearchBar.module.css";
import FancyLevel from "../../FancyLevel/FancyLevel.jsx";
import StylesHelper from "../../../helper/StylesHelper.js";
import TypeButtons from "../../TypeButtons/TypeButtons.jsx";

function LevelSearchBarCategory({ category, filtered }) {
  /* ===== CONTEXTS ===== */

  // appData state from app data context
  const { appData } = useContext(AppDataContext);

  // game state from game context
  const { game } = useContext(GameContext);

  /* ===== VARIABLES ===== */
  const { name: categoryName } = appData.categories[category];

  /* ===== FUNCTIONS ===== */

  // helper funcitons
  const { indexToParity } = StylesHelper();

  /* ===== LEVEL SEARCH BAR CATEGORY ===== */
  return filtered[category].length > 0 &&
    <>
      { /* First, render the category of games (either main or custom) */ }
      <div className={ styles.result }>
        <h3>{ categoryName }</h3>
      </div>

      { /* Then, render the first 5 levels within that category */ }
      { filtered[category].slice(0, 5).map((level, index) => {
        return (
          <div className={ `${ styles.result } ${ indexToParity(index) }` } key={ level.name }>
            <FancyLevel level={ level.name } />
            <TypeButtons abb={ game.abb } category={ category } level={ level } />
          </div>
        );
      })}

    </>;
};

/* ===== EXPORTS ===== */
export default LevelSearchBarCategory;