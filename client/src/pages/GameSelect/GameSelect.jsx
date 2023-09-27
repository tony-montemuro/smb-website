/* ===== IMPORTS ===== */
import "./GameSelect.css";
import GameSearch from "../../components/GameSearch/GameSearch.jsx";

function GameSelect({ imageReducer }) {
  /* ===== VARIABLES ===== */
  const GAMES_PER_PAGE = 20;
  const gameRowOptions = { useCard: true };

  /* ===== GAME SELECT COMPONENT ===== */
  return (
    <div className="game-select">

      { /* Page Header - render the name of the page */ }
      <div className="game-select-header">
        <h1>Games</h1>
      </div>

      { /* Game Search component */ }
      <GameSearch 
        gamesPerPage={ GAMES_PER_PAGE }
        imageReducer={ imageReducer }
        gameRowOptions={ gameRowOptions }
      />
      
    </div>
  );
};

/* ===== EXPORTS ===== */
export default GameSelect;