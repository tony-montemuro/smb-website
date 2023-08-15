/* ===== IMPORTS ===== */
import SearchBarInput from "../SearchBarInput/SearchBarInput.jsx";
import LevelSearchBarCategory from "./LevelSearchBarCategory";
import LevelSearchBarLogic from "./LevelSearchBar.js";

function LevelSearchBar({ abb }) {
  /* ===== FUNCTIONS ===== */

  // states and functions from the js file
  const { filtered, searchRef, handleFilter, clearSearch, onResultClick } = LevelSearchBarLogic(abb);

  /* ===== LEVEL SEARCH BAR COMPONENT ===== */
  return (
    <div className="game-layout-level-searchbar">

      { /* Render the search bar input */ }
      <SearchBarInput itemType={ "level" } searchRef={ searchRef } handleFilter={ handleFilter } clearSearch={ clearSearch } />

      { /* Only render search results if the filtered state has any elements. */ }
      { (filtered.main.length > 0 || filtered.misc.length > 0) &&
      
        // The results of the search, which are stored in the filtered array. This state will be updated each time
        // the user makes a keystroke. Note: only the first 5 results from each category will be rendered.
        <div className="game-layout-level-searchbar-results">
          <LevelSearchBarCategory abb={ abb } category={ "main" } filtered={ filtered } onResultClick={ onResultClick } />
          <LevelSearchBarCategory abb={ abb } category={ "misc" } filtered={ filtered } onResultClick={ onResultClick } />
        </div> 
      }
    </div>
  );
};

/* ===== EXPORTS ===== */
export default LevelSearchBar;