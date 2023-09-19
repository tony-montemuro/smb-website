/* ===== IMPORTS ====== */
import "./GameLayout.css";
import { GameContext, MessageContext } from "../../utils/Contexts";
import { Link } from "react-router-dom";
import { Outlet, useParams } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import BoxArt from "../BoxArt/BoxArt.jsx";
import GameHeaderInfo from "./GameHeaderInfo";
import GameHelper from "../../helper/GameHelper";
import GameLayoutInfo from "./GameLayoutInfo";
import GameLayoutLogic from "./GameLayout.js";
import LevelSearchBar from "./LevelSearchBar.jsx";
import ModeratorContainer from "./ModeratorContainer";

function GameLayout({ imageReducer }) {
  /* ===== VARIABLES ===== */
  const params = useParams();
  const { abb } = params;
  const navigate = useNavigate();
  const BOX_WIDTH = 150;

  /* ===== CONTEXTS ====== */

  // add message function from message context
  const { addMessage } = useContext(MessageContext);

  /* ===== STATES ===== */
  const [game, setGame] = useState(undefined);

  /* ===== FUNCTIONS ===== */

  // database functions
  const { fetchGame } = GameLayoutLogic();

  // helper functions
  const { getGameCategories } = GameHelper();

  /* ===== EFFECTS ===== */

  // code that is executed when the component is mounted
  useEffect(() => {
    async function initGame() {
      // fetch game from database
      const game = await fetchGame(abb);
      
      // if game does not exist, render error message and navigate back home
      if (!game) {
        addMessage("Game does not exist.", "error");
        navigate("/");
        return;
      }

      // update game state hook
      setGame(game);
    };
   
    initGame();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ===== GAME LAYOUT COMPONENT ===== */
  return game ?
    <GameContext.Provider value={ { game } }>
      {/* Game Layout Header - Render general game information at top of each game page */}
      <div className="game-layout-header">

        { /* Render the box art */ }
        <Link to={ `/games/${ game.abb }` }>
          <BoxArt game={ game } imageReducer={ imageReducer } width={ BOX_WIDTH } />
        </Link>

        { /* Render information about the game: */ }
        <GameHeaderInfo game={ game } />

        { /* Render the level search bar */ }
        <LevelSearchBar />

      </div>

      {/* Game Layout Body - Render specific page information, as well as sidebar */}
      <div className="game-layout-body">

        {/* Game Layout Content - The actual page itself. */}
        <div className="game-layout-body-content">
          <Outlet />
        </div>

        { /* Game Layout Info - a set of links used to navigate various game pages. */ }
        <div className="game-layout-info-container">
          <div className="game-layout-info-container-header">
            <h2>Rankings</h2>
          </div>
          { getGameCategories(game).map(category => {
            return <GameLayoutInfo category={ category }  game={ game } key={ category } />
          })}
          <div className="game-layout-info-container-header">
            <h2>Moderators</h2>
            <ModeratorContainer imageReducer={ imageReducer } />
          </div>
        </div>
        
      </div>
    </GameContext.Provider>
  :
    // Loading component
    <p>Loading...</p>
};

/* ===== EXPORTS ===== */
export default GameLayout;