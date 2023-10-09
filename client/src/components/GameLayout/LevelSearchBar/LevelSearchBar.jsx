/* ===== IMPORTS ===== */
import { GameContext } from "../../../utils/Contexts.js";
import { useContext, useEffect } from "react";
import styles from "./LevelSearchBar.module.css";
import GameHelper from "../../../helper/GameHelper.js";
import SearchBarInput from "../../SearchBarInput/SearchBarInput.jsx";
import LevelSearchBarCategory from "./LevelSearchBarCategory";
import LevelSearchBarLogic from "./LevelSearchBar.js";

function LevelSearchBar() {
  /* ===== CONTEXTS ===== */

  // game state from game context
  const { game } = useContext(GameContext);

  /* ===== HELPER FUNCTIONS ===== */
  const { getGameCategories } = GameHelper();

  /* ===== VARIABLES ===== */
  const categories = getGameCategories(game);

  /* ===== FUNCTIONS ===== */

  // states and functions from the js file
  const { filtered, searchInput, setSearchInput, handleFilter, hasElements } = LevelSearchBarLogic();

  /* ===== EFFECTS ===== */

  // code that is executed each time the searchInput is updated
  useEffect(() => {
    handleFilter(searchInput);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  /* ===== LEVEL SEARCH BAR COMPONENT ===== */
  return (
    <div className={ styles.searchbar }>

      { /* Render the search bar input */ }
      <SearchBarInput itemType={ "level" } input={ searchInput } setInput={ setSearchInput } />

      { /* Only render search results if the filtered state has any elements. */ }
      { filtered && hasElements() &&
        <div className={ styles.results }>
          { categories.map(category => {
            return <LevelSearchBarCategory category={ category } filtered={ filtered } />;
          })}
        </div>
      }

    </div>
  );
};

/* ===== EXPORTS ===== */
export default LevelSearchBar;