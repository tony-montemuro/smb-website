/* ===== IMPORTS ===== */
import { GameContext } from "../../../utils/Contexts";
import { useContext } from "react";
import styles from "./LevelSearchBar.module.css";
import FrontendHelper from "../../../helper/FrontendHelper.js";
import StylesHelper from "../../../helper/StylesHelper.js";
import TypeButtons from "../../TypeButtons/TypeButtons.jsx";

function LevelSearchBarCategory({ category, filtered }) {
  /* ===== CONTEXTS ===== */

  // game state from game context
  const { game } = useContext(GameContext);

  /* ===== FUNCTIONS ===== */

  // helper funcitons
  const { categoryB2F, cleanLevelName } = FrontendHelper();
  const { indexToParity } = StylesHelper();

  /* ===== LEVEL SEARCH BAR CATEGORY ===== */
  return filtered[category].length > 0 &&
    <>
      { /* First, render the category of games (either main or custom) */ }
      <div className={ styles.result }>
        <h3>{ categoryB2F(category) }</h3>
      </div>

      { /* Then, render the first 5 levels within that category */ }
      { filtered[category].slice(0, 5).map((level, index) => {
        return (
          <div className={ `${ styles.result } ${ indexToParity(index) }` } key={ level.name }>
            <span>{ cleanLevelName(level.name) }</span>
            <TypeButtons abb={ game.abb } category={ category } level={ level } />
          </div>
        );
      })}

    </>;
};

/* ===== EXPORTS ===== */
export default LevelSearchBarCategory;