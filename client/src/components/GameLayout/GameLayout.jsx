/* ===== IMPORTS ====== */
import { AppDataContext, GameContext, MessageContext } from "../../utils/Contexts";
import { Outlet, useParams } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./GameLayout.module.css";
import Container from "../Container/Container.jsx";
import GameHeader from "./Containers/GameHeader.jsx";
import GameHelper from "../../helper/GameHelper";
import GameLayoutLogic from "./GameLayout.js";
import Loading from "../../components/Loading/Loading.jsx";
import ModeratorContainer from "./Containers/ModeratorContainer";
import RankingsContents from "./Containers/RankingsContents.jsx";

function GameLayout({ imageReducer }) {
  /* ===== VARIABLES ===== */
  const params = useParams();
  const { abb } = params;
  const navigateTo = useNavigate();

  /* ===== CONTEXTS ====== */

  // appData state from app data context
  const { appData } = useContext(AppDataContext);

  // add message function from message context
  const { addMessage } = useContext(MessageContext);

  /* ===== STATES ===== */
  const [game, setGame] = useState(undefined);
  const [version, setVersion] = useState(null);

  /* ===== FUNCTIONS ===== */

  // database functions
  const { fetchGame, handleVersionChange } = GameLayoutLogic(game, setVersion);

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
        addMessage("Game does not exist.", "error", 6000);
        navigateTo("/games");
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
      { game && appData ?
        <GameContext.Provider value={ { game, version, handleVersionChange } }>
          <GameHeader imageReducer={ imageReducer } />
          <div className={ styles.body }>

            { /* Left - render the content of the game layout */ }
            <div className={ styles.bodyLeft }>
              <Outlet />
            </div>

            { /* Right - render the sidebar, which includes things such as the rankings, game moderators, etc. */ }
            <div className={ styles.bodyRight }>
              <Container title="Rankings" largeTitle>
                { getGameCategories(game).map(category => {
                  return <RankingsContents category={ category } key={ category } />
                })}
              </Container>
              <Container title="Moderators" largeTitle>
                <ModeratorContainer imageReducer={ imageReducer } />
              </Container>
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