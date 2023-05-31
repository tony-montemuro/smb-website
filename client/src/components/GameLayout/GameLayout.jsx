/* ===== IMPORTS ====== */
import "./GameLayout.css";
import { GameContext, MessageContext, StaticCacheContext } from "../../Contexts";
import { Link } from "react-router-dom";
import { Outlet, useParams } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import BoxArt from "../BoxArt/BoxArt.jsx";
import GameHelper from "../../helper/GameHelper";
import GameLayoutInfo from "./GameLayoutInfo";
import SearchBar from "../SearchBar/SearchBar.jsx";

function GameLayout({ imageReducer }) {
  /* ===== VARIABLES ===== */
  const params = useParams();
  const { abb } = params;
  const navigate = useNavigate();
  const BOX_WIDTH = 150;

  /* ===== CONTEXTS ====== */

  // static cache state from static cache context
  const { staticCache } = useContext(StaticCacheContext);

  // add message function from message context
  const { addMessage } = useContext(MessageContext);

  /* ===== STATES ===== */
  const [game, setGame] = useState(undefined);

  /* ===== FUNCTIONS ===== */

  // helper functions
  const { hasMiscCategory } = GameHelper();

  /* ===== EFFECTS ===== */

  // code that is executed when the component is mounted, and when the static cache is updated
  useEffect(() => {
    if (staticCache.games.length > 0) {
      // see if abb corresponds to a game stored in cache
      const games = staticCache.games;
      const game = games.find(row => row.abb === abb);

      // if not, we will print an error message, and navigate to the home screen
      if (!game) {
        addMessage("Game does not exist.", "error");
        navigate("/");
        return;
      }

      // update the game state hook
      setGame(game);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [staticCache]);

  /* ===== GAME LAYOUT COMPONENT ===== */
  return game ?
    <>
      {/* Game Layout Header - Render general game information at top of each game page */}
      <div className="game-layout-header">

        { /* Render the box art */ }
        <Link to={ `/games/${ game.abb }` }>
          <BoxArt game={ game } imageReducer={ imageReducer } width={ BOX_WIDTH } />
        </Link>

        { /* Render information about the game: title, whether it's a main or custom pack, and the release date */ }
        <div className="game-layout-header-title">
          <Link to={ `/games/${ game.abb }` }>
            <h1>{ game.name }</h1>
          </Link>
          <p>Release Date: { game.release_date } </p>
          <p> { game.custom ? "Custom Pack" : "Main Game" } </p>
        </div>

        { /* Render the level search bar */ }
        <SearchBar abb={ game.abb } />

      </div>

      {/* Game Layout Body - Render specific page information, as well as sidebar */}
      <div className="game-layout-body">

        {/* Game Layout Content - The actual page itself. */}
        <div className="game-layout-body-content">
          <GameContext.Provider value={ { game } }>
            <Outlet />
          </GameContext.Provider>
        </div>

        { /* Game Layout Sidebar - a set of links used to navigate various game pages. */ }
        <div className="game-layout-body-sidebar">
          <GameLayoutInfo abb={ game.abb } category={ "main" } />
          { hasMiscCategory(game) && <GameLayoutInfo abb={ game.abb } category={ "misc" } /> }
        </div>
        
      </div>
    </>
  :
    // Loading component
    <p>Loading...</p>
};

/* ===== EXPORTS ===== */
export default GameLayout;