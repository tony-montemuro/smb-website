/* ===== IMPORTS ====== */
import { GameContext, ToastContext } from "../../utils/Contexts";
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
import RankingsContent from "./Containers/RankingsContents.jsx";

function GameLayout({ imageReducer }) {
  /* ===== VARIABLES ===== */
  const params = useParams();
  const { abb } = params;
  const navigate = useNavigate();

  /* ===== CONTEXTS ====== */

  // add message function from toast context
  const { addToastMessage } = useContext(ToastContext);

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
        addToastMessage("Game does not exist.", "error", 6000);
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
          <div className={ styles.body }>

            { /* Left - render the content of the game layout */ }
            <div className={ styles.bodyLeft }>
              <Outlet />
            </div>

            { /* Right - render the sidebar, which includes things such as the rankings, game moderators, etc. */ }
            <div className={ styles.bodyRight }>
              <Container title="Rankings" largeTitle>
                { getGameCategories(game).map(category => {
                  return <RankingsContent category={ category } key={ category } />
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