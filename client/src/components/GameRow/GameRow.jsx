/* ===== IMPORTS ===== */
import "./GameRow.css";
import { Link } from "react-router-dom";
import BoxArt from "../BoxArt/BoxArt.jsx";

function GameRow({ game, imageReducer, useCard, onClick = undefined }) {
  /* ===== VARIABLES ===== */
  const BOX_WIDTH = useCard ? 200 : 50;

  /* ===== GAME ROW COMPONENT ===== */
  if (useCard) {

    // if useCard is true, render each game as a series of "cards" 
    return (
      <div className="game-row-card" onClick={ onClick ? () => onClick(game) : null }>
        <Link to={ { pathname: `/games/${ game.abb }` } }>
          <BoxArt game={ game } imageReducer={ imageReducer } width={ BOX_WIDTH } />
          <p>{ game.name } </p>
        </Link>
      </div>
    );

  } else {

    // Otherwise, just render a normal row
    return (
      <div className="game-row-item" onClick={ onClick ? () => onClick(game) : null }>
        <BoxArt game={ game } imageReducer={ imageReducer } width={ BOX_WIDTH } />
        <p>{ game.name } </p>
      </div>
    );

  }
};

/* ===== EXPORTS ===== */
export default GameRow;