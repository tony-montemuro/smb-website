/* ===== IMPORTS ===== */
import styles from "./GameRow.module.css";
import { Link } from "react-router-dom";
import BoxArt from "../BoxArt/BoxArt.jsx";
import StylesHelper from "../../helper/StylesHelper.js";

function GameRow({ 
  game, 
  imageReducer, 
  useCard, 
  onClick = undefined, 
  index = 0, 
  extraContent = undefined,
  selectedGame = undefined
  }) {
  /* ===== VARIABLES ===== */
  const BOX_WIDTH = useCard ? 200 : 50;
  const name = extraContent ? game.name + " " + extraContent : game.name;

  /* ===== FUNCTIONS ===== */

  // helper functions
  const { indexToParity } = StylesHelper();

  /* ===== GAME ROW COMPONENT ===== */
  if (useCard) {

    // if useCard is true, render each game as a series of "cards" 
    return (
      <div className={ styles.card }>
        <Link to={ { pathname: `/games/${ game.abb }` } }>
          <BoxArt game={ game } imageReducer={ imageReducer } width={ BOX_WIDTH } />
          <p>{ name } </p>
        </Link>
      </div>
    );

  } else {

    // Otherwise, just render a normal row
    return (
      <div 
        className={ `${ styles.item } ${ selectedGame && game.abb === selectedGame ? styles.selected : indexToParity(index) }` }
        onClick={ onClick ? () => onClick(game) : null }
      >
        <BoxArt game={ game } imageReducer={ imageReducer } width={ BOX_WIDTH } />
        <p>{ name } </p>
      </div>
    );

  }
};

/* ===== EXPORTS ===== */
export default GameRow;