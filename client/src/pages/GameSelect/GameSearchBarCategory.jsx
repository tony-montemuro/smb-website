/* ===== IMPORTS ===== */
import { Link } from "react-router-dom";
import BoxArt from "../../components/BoxArt/BoxArt.jsx";
import FrontendHelper from "../../helper/FrontendHelper.js";

function GameSearchBarCategory({ category, filtered, imageReducer }) {
  /* ===== FUNCTIONS ===== */
  const { capitalize } = FrontendHelper();

  /* ===== GAME SEARCH BAR CATEGORY ===== */
  return filtered[category].length > 0 &&
    <>
      { /* First, render the category of games (either main or custom) */ }
      <div className="game-searchbar-category">
        { capitalize(category) } Games
      </div>

      { /* Then, render all games within that category */ }
      { filtered[category].map(game => {
        return (
          <div className="game-searchbar-result" key={ game.abb }>
            <Link to={ `/games/${ game.abb }` }>
              <BoxArt game={ game } imageReducer={ imageReducer } width={ 50 } />
            </Link>
            <Link to={ `/games/${ game.abb }` }>
              <span>{ game.name }</span>
            </Link>
          </div>
        );
      })}

    </>
};

/* ===== EXPORTS ===== */
export default GameSearchBarCategory;