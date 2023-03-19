/* ===== IMPORTS ===== */
import "./SearchBar.css";
import { StaticCacheContext } from "../../Contexts";
import { useContext } from "react";
import FrontendHelper from "../../helper/FrontendHelper";
import LevelboardButton from "../LevelboardButton/LevelboardButton";
import SearchBarLogic from "./SearchBar.js";

function SearchBar({ abb }) {
  /* ===== CONTEXTS ===== */

  // static cache state from static cache context
  const { staticCache } = useContext(StaticCacheContext);

  /* ===== VARIABLES ===== */
  const game = staticCache.games.find(row => row.abb === abb);

  /* ===== FUNCTIONS ===== */

  // states and functions from the js file
  const { filtered, searchRef, handleFilter, clearSearch } = SearchBarLogic(abb);

  // helper functions
  const { cleanLevelName } = FrontendHelper();

  /* ===== SEARCH BAR COMPONENT ===== */
  return (
    <div className="searchbar">

      { /* Input container - The searchbar itself, including the text field for the user, and the icon. */ }
      <div className="searchbar-inputs-container">

        { /* SearchBar input: allows a user to type a level name, which will modify the filtered state. */ }
        <input 
          className="searchbar-input"
          type="text"
          ref={ searchRef }
          placeholder="Search for level..."
          onChange={ (e) => handleFilter(e.target.value) }
        />

        { /* SearchBar icon: an icon, which is initially just for decoration, turns into a clickable icon when user enters any text. */ }
        <div className="searchbar-icon">
          { searchRef.current && searchRef.current.value.length > 0 ?
            <button className="searchbar-clear" onClick={ clearSearch }>❌</button> 
          : 
            <>🔍</> 
          }
        </div>

      </div>

      { /* Only render search results if the filtered state has any elements. */ }
      { filtered.length > 0 &&
      
        // The results of the search, which are stored in the filtered array. This state will be updated each time
        // the user makes a keystroke. Note: only the first 10 results will be rendered.
        <div className="searchbar-results">
          { filtered.slice(0, 10).map(level => {
            
            // the category of the level, which is determined by the misc field
            const category = level.misc ? "misc" : "main";

            return (

              // SearchBar item: Consists of 3 parts: the level name, a button for score chart (optional), and a button for time chart (optional)
              <div className="searchbar-item" key={ level.name }>

                { /* The first part of a result is the name of the level. */ }
                <span className="searchbar-item-name">{ cleanLevelName(level.name) }</span>

                { /* The second part of a result will depend on the chart_type of the level. If it is a score or both
                chart, we want to render a button that will allow the user to navigate to the corresponding level score chart.
                However, if it is a time chart, an empty span element will be rendered. */ }
                { level.chart_type === "both" || level.chart_type === "score" ?
                  <LevelboardButton abb={ game.abb } category={ category } type={ "score" } levelName={ level.name } />
                :
                  <span className="searchbar-item-empty"></span>
                }

                { /* The third part of a result will depend on the chart_type of the level. If it is a time or both
                chart, we want to render a button that will allow the user to navigate to the corresponding level time chart.
                However, if it is a score chart, an empty span element will be rendered. */ }
                { level.chart_type === "time" || level.chart_type === "both" ?
                  <LevelboardButton abb={ game.abb } category={ category } type={ "time" } levelName={ level.name } />
                :
                  <span className="searchbar-item-empty"></span>
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
export default SearchBar;