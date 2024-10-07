/* ===== IMPORTS ===== */
import { GameContext } from "../../../utils/Contexts.js";
import { useContext } from "react";
import { Link } from "react-router-dom";
import styles from "./GameHeader.module.css";
import BoxArt from "../../BoxArt/BoxArt.jsx";
import Container from "../../Container/Container.jsx";
import DownloadIcon from "@mui/icons-material/Download";
import LevelSearchBar from "../LevelSearchBar/LevelSearchBar.jsx";
import Username from "../../Username/Username.jsx";

function GameHeader({ disableVersionDropdown, imageReducer }) {
  /* ===== VARIABLES ===== */
  const BOX_WIDTH = 146;

  /* ===== CONTEXTS ===== */
  
  // game state, version state, and handle version change function from game context
  const { game, version, handleVersionChange } = useContext(GameContext);
  
  /* ===== GAME HEADER COMPONENT ===== */
  return (
    <Container>
      <div className={ styles.gameHeader }>
        <div className={ styles.left }>

          { /* Render the box art */ }
          <div id={ styles.boxart }>
            <Link to={ `/games/${ game.abb }` }>
              <BoxArt game={ game } imageReducer={ imageReducer } width={ BOX_WIDTH } />
            </Link>
          </div>

          { /* Render the name of the game, and it's information */ }
          <div className={ styles.info }>
            <Link to={ `/games/${ game.abb }` }>
              <h1>{ game.name }</h1>
            </Link>
            { game.custom && game.creator && <span>Custom Game by:&nbsp;&nbsp;<Username profile={ game.creator } /></span> }
            <span>Release Date: { game.release_date }</span>
            { game.custom &&
              <span>Game Download:
                <a href={ game.download } target="_blank" rel="noopener noreferrer">
                  <DownloadIcon className="inline-icon" />
                </a>
              </span>
            }

            { /* If game has any versions, let's allow user to update version here */ }
            { game.version.length > 0 &&
              <div className={ styles.version }>
                <label htmlFor="version">Version: </label>
                <select id="version" onChange={ handleVersionChange } value={ version.id } disabled={ disableVersionDropdown } >
                  { game.version.map(version => (
                    <option value={ version.id } key={ version.id } >{ version.version }</option>
                  ))}
                </select>
              </div>
            }
          </div>

        </div>

        { /* Render level search bar */ }
        <LevelSearchBar />
        
      </div>
    </Container>
  );
};

/* ===== EXPORTS ===== */
export default GameHeader;