/* ===== IMPORTS ===== */
import "./GameSelect.css";
import { StaticCacheContext } from "../../utils/Contexts";
import { useContext } from "react";
import BoxArt from "../BoxArt/BoxArt.jsx";

function GameSelect({ recent, gameAbb, setGameAbb, imageReducer }) {
  /* ===== CONTEXTS ===== */

  // static cache from static cache context
  const { staticCache } = useContext(StaticCacheContext);

  /* ===== GAME SELECT COMPONENT ===== */
  return (
    <div className="game-select">
      <div className="game-select-tabs">
        { Object.entries(recent)
          .sort((a, b) => b[1].length - a[1].length)
          .map(row => {
            const abb = row[0];
            const num = row[1].length;
            const game = staticCache.games.find(row => row.abb === abb);
            return ( 
              <div
                className={ `game-select-tab ${ abb === gameAbb ? "game-select-tab-active" : "" }` }
                onClick={ () => setGameAbb(abb) }
                key={ abb }
              >
                <BoxArt game={ game } imageReducer={ imageReducer } width={ 50 } />
                <span>{ game.name }{ num > 0 && ` (${ num })` }</span>
              </div>
            );
        })}
      </div>
    </div>
  );
};

/* ===== EXPORTS ===== */
export default GameSelect;