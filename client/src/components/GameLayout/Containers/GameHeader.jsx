/* ===== IMPORTS ===== */
import { GameContext } from "../../../utils/Contexts.js";
import { useContext } from "react";
import { Link } from "react-router-dom";
import styles from "./GameHeader.module.css";
import BoxArt from "../../BoxArt/BoxArt.jsx";
import DownloadIcon from "@mui/icons-material/Download";
import LevelSearchBar from "../LevelSearchBar/LevelSearchBar.jsx";
import Username from "../../Username/Username.jsx";

function GameHeader({ imageReducer }) {
  /* ===== VARIABLES ===== */
  const BOX_WIDTH = 146;

  /* ===== CONTEXTS ===== */
  
  // game state from game context
  const { game } = useContext(GameContext);
  
  /* ===== GAME HEADER COMPONENT ===== */
  return (
    <header className={ styles.gameHeader }>
      <div className={ styles.left }>

        { /* Render the box art */ }
        <Link to={ `/games/${ game.abb }` }>
          <BoxArt game={ game } imageReducer={ imageReducer } width={ BOX_WIDTH } />
        </Link>

        { /* Render the name of the game, and it's information */ }
        <div className={ styles.info }>
          <Link to={ `/games/${ game.abb }` }>
            <h1>{ game.name }</h1>
          </Link>
          { game.custom && <span>Custom Game by:&nbsp;&nbsp;<Username profile={ game.creator } /></span> }
          <span>Release Date: { game.release_date }</span>
          { game.custom &&
            <span>Game Download:
              <a href={ game.download } target="_blank" rel="noopener noreferrer">
                <DownloadIcon className="inline-icon" />
              </a>
            </span>
          }
        </div>

      </div>

      { /* Render level search bar */ }
      <LevelSearchBar />
    </header>
  );
};

/* ===== EXPORTS ===== */
export default GameHeader;