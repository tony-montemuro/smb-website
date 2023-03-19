/* ===== IMPORTS ===== */
import "./GameSelect.css";
import { StaticCacheContext } from "../../Contexts";
import { useContext } from "react";
import GameCard from "../../components/GameCard/GameCard.jsx";

function GameSelect({ imageReducer }) {
  /* ===== CONTEXTS ===== */

	// static cache state from static cache context
  const { staticCache } = useContext(StaticCacheContext);

  /* ===== GAME SELECT COMPONENT ===== */
  return (
    <>
      { /* Page Header */ }
      <h1>Select a Game</h1>

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
                  <GameCard key={ game.abb } game={ game } imageReducer={ imageReducer } />
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