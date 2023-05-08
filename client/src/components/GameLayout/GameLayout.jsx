/* ===== IMPORTS ====== */
import { GameContext, StaticCacheContext } from "../../Contexts";
import { Outlet, useParams } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function GameLayout() {
  /* ===== VARIABLES ===== */
  const params = useParams();
  const { abb } = params;
  const navigate = useNavigate();

  /* ===== CONTEXTS ====== */

  // static cache state from static cache context
  const { staticCache } = useContext(StaticCacheContext);

  /* ===== STATES ===== */
  const [game, setGame] = useState(undefined);

  /* ===== EFFECTS ===== */

  // code that is executed when the component is mounted, and when the static cache is updated
  useEffect(() => {
    if (staticCache.games.length > 0) {
      // see if abb corresponds to a game stored in cache
      const games = staticCache.games;
      const game = games.find(row => row.abb === abb);

      // if not, we will print an error message, and navigate to the home screen
      if (!game) {
        console.log("Error: Invalid game.");
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
      <h1>Game Layout!</h1>
      <GameContext.Provider value={ { game } }>
        <Outlet />
      </GameContext.Provider>
    </>
  :
    // Loading component
    <p>Loading...</p>
};

/* ===== EXPORTS ===== */
export default GameLayout;