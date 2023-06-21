/* ===== IMPORTS ===== */
import "./GameSelect.css";
import { Link } from "react-router-dom";
import { StaticCacheContext } from "../../Contexts";
import { useContext } from "react";
import BoxArt from "../../components/BoxArt/BoxArt.jsx";

function GameSelect({ imageReducer }) {
  /* ===== VARIABLES ===== */
  const BOX_WIDTH = 200;

  /* ===== CONTEXTS ===== */

	// static cache state from static cache context
  const { staticCache } = useContext(StaticCacheContext);

  /* ===== GAME SELECT COMPONENT ===== */
  return (
    <>
      { /* Page Header */ }
      <div className="game-select-header">
        <h1>Games</h1>
      </div>

      { /* Render two separate game select menus: one for main games, and one for custom games. */ }
      { ["Main", "Custom"].map(type => {
        return (
          <div key={ type } className="game-select">
            <h2>{ type } Games</h2>
            <div className="game-select-cards">

              { /* If the games data has loaded from the database, we will filter and map each one to the screen as a card.
              Otherwise, render a loading component. */ }
              { staticCache.games.length > 0 ?
                staticCache.games.filter(game => type === "Custom" ? game.custom : !game.custom).map(game => (
                  <div className="game-select-card" key={ game.abb }>
                    <Link to={ { pathname: `/games/${ game.abb }` } }>
                      <BoxArt game={ game } imageReducer={ imageReducer } width={ BOX_WIDTH } />
                      <p>{ game.name } </p>
                    </Link>
                  </div>
                ))
              :
                <p>Loading...</p>
              }
            </div>
          </div>
      )})}
    </>
  );
};

/* ===== EXPORTS ===== */
export default GameSelect;