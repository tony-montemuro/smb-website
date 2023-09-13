/* ===== IMPORTS ===== */
import { Link } from "react-router-dom";
import Username from "../Username/Username";
import DownloadIcon from "@mui/icons-material/Download";

function GameHeaderInfo({ game }) {
  /* ===== GAME HEADER INFO COMPONENT ===== */
  return (
    <div className="game-layout-header-info">
      { /* First, render a link to the game page. This is the same for main and custom games. */ }
      <Link to={ `/games/${ game.abb }` }>
        <h1>{ game.name }</h1>
      </Link>

      { game.custom ?
        // If game us custom, render the name of the creator, the release date, and the pack download
        <ul>
          <li>
            Custom Game by <Username profile={ game.creator } />
          </li>  
          <li>Release Date: { game.release_date }</li>
          <li id="game-layout-header-download">Game Download:
            <a href={ game.download } target="_blank" rel="noopener noreferrer">
              <DownloadIcon />
            </a>
          </li>
        </ul>
      :  
        
      // Otherwise, it is a main game. For this, just render that it's a main game, as well as the release date.
        <ul>
          <li>Main Game</li>
          <li>Release Date: { game.release_date }</li>
        </ul>
      }

    </div>

  );
};

/* ===== EXPORTS ===== */
export default GameHeaderInfo;