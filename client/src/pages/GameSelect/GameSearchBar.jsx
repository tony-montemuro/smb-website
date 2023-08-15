/* ===== IMPORTS ===== */
import GameSearchBarCategory from "./GameSearchBarCategory.jsx";
import GameSearchBarLogic from "./GameSearchBar.js";
import SearchBarInput from "../../components/SearchBarInput/SearchBarInput.jsx";

function GameSearchBar({ imageReducer }) {
  /* ===== STATES & FUNCTIONS ===== */

  // states & functions from the js file
  const { searchRef, filtered, handleFilter, clearSearch } = GameSearchBarLogic();

  /* ===== GAME SEARCH BAR COMPONENT ===== */
  return (
    <div className="game-searchbar">
      { /* First, render the input itself */ }
      <SearchBarInput itemType={ "game" } searchRef={ searchRef } handleFilter={ handleFilter } clearSearch={ clearSearch } />

      { /* Next, render the results, if any are present */ }
      { (filtered.main.length > 0 || filtered.custom.length > 0) &&
        <div className="game-searchbar-results">
          <GameSearchBarCategory category={ "main" } filtered={ filtered } imageReducer={ imageReducer } />
          <GameSearchBarCategory category={ "custom" } filtered={ filtered } imageReducer={ imageReducer } />
        </div>
      }
    </div>
  );
};

/* ===== EXPORTS ===== */
export default GameSearchBar;