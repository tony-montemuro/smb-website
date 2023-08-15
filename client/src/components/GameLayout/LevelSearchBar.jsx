/* ===== IMPORTS ===== */
import { StaticCacheContext } from "../../utils/Contexts";
import { useContext } from "react";
import FrontendHelper from "../../helper/FrontendHelper";
import LevelboardButton from "../LevelboardButton/LevelboardButton";
import SearchBarInput from "../SearchBarInput/SearchBarInput.jsx";
import LevelSearchBarLogic from "./LevelSearchBar.js";

function LevelSearchBar({ abb }) {
  /* ===== CONTEXTS ===== */

  // static cache state from static cache context
  const { staticCache } = useContext(StaticCacheContext);

  /* ===== VARIABLES ===== */
  const game = staticCache.games.find(row => row.abb === abb);

  /* ===== FUNCTIONS ===== */

  // states and functions from the js file
  const { filtered, searchRef, handleFilter, clearSearch, onResultClick } = LevelSearchBarLogic(abb);

  // helper functions
  const { cleanLevelName } = FrontendHelper();

  /* ===== LEVEL SEARCH BAR COMPONENT ===== */
  return (
    <div className="game-layout-level-searchbar">

      { /* Render the search bar input */ }
      <SearchBarInput itemType={ "level" } searchRef={ searchRef } handleFilter={ handleFilter } clearSearch={ clearSearch } />

      { /* Only render search results if the filtered state has any elements. */ }
      { filtered.length > 0 &&
      
        // The results of the search, which are stored in the filtered array. This state will be updated each time
        // the user makes a keystroke. Note: only the first 10 results will be rendered.
        <div className="game-layout-level-searchbar-results">
          { filtered.slice(0, 10).map(level => {
            
            // the category of the level, which is determined by the misc field
            const category = level.misc ? "misc" : "main";

            return (

              // Game layout level searchbar item: Consists of 3 parts: the level name, a button for score chart (optional),
              // and a button for time chart (optional)
              <div className="game-layout-level-searchbar-item" key={ level.name }>

                { /* The first part of a result is the name of the level. */ }
                <span className="game-layout-level-searchbar-item-name">{ cleanLevelName(level.name) }</span>

                { /* The second part of a result will depend on the chart_type of the level. If it is a score or both
                chart, we want to render a button that will allow the user to navigate to the corresponding level score chart.
                However, if it is a time chart, an empty span element will be rendered. */ }
                { level.chart_type === "both" || level.chart_type === "score" ?
                  <LevelboardButton abb={ game.abb } category={ category } type={ "score" } levelName={ level.name } onClickFunc={ onResultClick } />
                :
                  <span className="game-layout-level-searchbar-item-empty"></span>
                }

                { /* The third part of a result will depend on the chart_type of the level. If it is a time or both
                chart, we want to render a button that will allow the user to navigate to the corresponding level time chart.
                However, if it is a score chart, an empty span element will be rendered. */ }
                { level.chart_type === "time" || level.chart_type === "both" ?
                  <LevelboardButton abb={ game.abb } category={ category } type={ "time" } levelName={ level.name } onClickFunc={ onResultClick } />
                :
                  <span className="game-layout-level-searchbar-item-empty"></span>
                }

              </div>
            );
          })}
        </div> 
      }
    </div>
  );
};

/* ===== EXPORTS ===== */
export default LevelSearchBar;