/* ===== IMPORTS ===== */
import { StaticCacheContext } from "../../utils/Contexts.js";
import { useContext } from "react";
import GameHelper from "../../helper/GameHelper.js";
import SearchBarInput from "../SearchBarInput/SearchBarInput.jsx";
import LevelSearchBarCategory from "./LevelSearchBarCategory";
import LevelSearchBarLogic from "./LevelSearchBar.js";

function LevelSearchBar({ abb }) {
  /* ===== CONTEXTS ===== */

  // static cache object from static cache context
  const { staticCache } = useContext(StaticCacheContext);

  /* ===== HELPER FUNCTIONS ===== */
  const { getGameCategories } = GameHelper();

  /* ===== VARIABLES ===== */
  const game = staticCache.games.find(row => row.abb === abb);
  const categories = getGameCategories(game);

  /* ===== FUNCTIONS ===== */

  // states and functions from the js file
  const { filtered, searchRef, handleFilter, hasElements, clearSearch, onResultClick } = LevelSearchBarLogic(abb);

  /* ===== LEVEL SEARCH BAR COMPONENT ===== */
  return (
    <div className="game-layout-level-searchbar">

      { /* Render the search bar input */ }
      <SearchBarInput itemType={ "level" } searchRef={ searchRef } handleFilter={ handleFilter } clearSearch={ clearSearch } />

      { /* Only render search results if the filtered state has any elements. */ }
      { filtered && hasElements() &&
      
        // The results of the search, which are stored in the filtered array. This state will be updated each time
        // the user makes a keystroke. Note: only the first 5 results from each category will be rendered.
        <div className="game-layout-level-searchbar-results">
          { categories.map(category => {
            return <LevelSearchBarCategory abb={ abb } category={ category } filtered={ filtered } onResultClick={ onResultClick } />;
          })}
        </div> 
      }
    </div>
  );
};

/* ===== EXPORTS ===== */
export default LevelSearchBar;