/* ===== IMPORTS ===== */
import styles from "./GameSelect.module.css";
import GameSearch from "../../components/GameSearch/GameSearch.jsx";

function GameSelect({ imageReducer }) {
  /* ===== VARIABLES ===== */
  const GAMES_PER_PAGE = 20;
  const gameRowOptions = { useCard: true };

  /* ===== GAME SELECT COMPONENT ===== */
  return (
    <div className={ styles.gameSelect }>
      <h1>Games</h1>
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