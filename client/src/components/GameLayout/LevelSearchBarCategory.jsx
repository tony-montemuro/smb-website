/* ===== IMPORTS ===== */
import { GameContext } from "../../utils/Contexts";
import { useContext } from "react";
import FrontendHelper from "../../helper/FrontendHelper.js";
import LevelboardButton from "../LevelboardButton/LevelboardButton.jsx";

function LevelSearchBarCategory({ category, filtered, onResultClick }) {
  /* ===== CONTEXTS ===== */

  // game state from game context
  const { game } = useContext(GameContext);

  /* ===== FUNCTIONS ===== */
  const { categoryB2F, cleanLevelName } = FrontendHelper();

  /* ===== LEVEL SEARCH BAR CATEGORY ===== */
  return filtered[category].length > 0 &&
    <>
      { /* First, render the category of games (either main or custom) */ }
      <div className="game-layout-level-searchbar-category">
        { categoryB2F(category) }
      </div>

      { /* Then, render the first 5 levels within that category */ }
      { filtered[category].slice(0, 5).map(level => {
        return (
          <div className="game-layout-level-searchbar-result" key={ level.name }>

            { /* The first part of a result is the name of the level. */ }
            <span className="game-layout-level-searchbar-result-name">{ cleanLevelName(level.name) }</span>

            { /* The second part of a result will depend on the chart_type of the level. If it is a score or both
            chart, we want to render a button that will allow the user to navigate to the corresponding level score chart.
            However, if it is a time chart, an empty span element will be rendered. */ }
            { level.chart_type === "both" || level.chart_type === "score" ?
              <LevelboardButton abb={ game.abb } category={ category } type={ "score" } levelName={ level.name } onClickFunc={ onResultClick } />
            :
              <span className="game-layout-level-searchbar-result-empty"></span>
            }

            { /* The third part of a result will depend on the chart_type of the level. If it is a time or both
            chart, we want to render a button that will allow the user to navigate to the corresponding level time chart.
            However, if it is a score chart, an empty span element will be rendered. */ }
            { level.chart_type === "time" || level.chart_type === "both" ?
              <LevelboardButton abb={ game.abb } category={ category } type={ "time" } levelName={ level.name } onClickFunc={ onResultClick } />
            :
              <span className="game-layout-level-searchbar-result-empty"></span>
            }
          </div>
        );
      })}

    </>;
};

/* ===== EXPORTS ===== */
export default LevelSearchBarCategory;