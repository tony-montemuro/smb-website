/* ===== IMPORTS ====== */
import "./GameLayout.css";
import { GameContext, MessageContext } from "../../utils/Contexts";
import { Outlet, useParams } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./GameLayout.module.css";
import GameHeader from "./Containers/GameHeader.jsx";
import GameHelper from "../../helper/GameHelper";
import GameLayoutInfo from "./Containers/GameLayoutInfo.jsx";
import GameLayoutLogic from "./GameLayout.js";
import Loading from "../../components/Loading/Loading.jsx";
import ModeratorContainer from "./Containers/ModeratorContainer";

function GameLayout({ imageReducer }) {
  /* ===== VARIABLES ===== */
  const params = useParams();
  const { abb } = params;
  const navigate = useNavigate();

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
  return (
    <div className={ styles.gameLayout }>
      { game ?
        <GameContext.Provider value={ { game } }>

          <GameHeader imageReducer={ imageReducer } />
    
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
                return <GameLayoutInfo category={ category } key={ category } />
              })}
              <div className="game-layout-info-container-header">
                <h2>Moderators</h2>
                <ModeratorContainer imageReducer={ imageReducer } />
              </div>
            </div>

          </div>
        </GameContext.Provider>
      :
        <Loading />
      }
    </div>
  );
};

/* ===== EXPORTS ===== */
export default GameLayout;