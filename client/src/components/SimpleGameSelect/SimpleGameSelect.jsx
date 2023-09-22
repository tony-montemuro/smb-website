/* ===== IMPORTS ===== */
import "./SimpleGameSelect.css";
import BoxArt from "../BoxArt/BoxArt.jsx";

function SimpleGameSelect({ games, game, setGame, imageReducer, countType = null }) {
  /* ===== SIMPLE GAME SELECT COMPONENT ===== */
  return (
    <div className="simple-game-select">

      { /* Render the component title */ }
      <div className="simple-game-select-title">
        <h2>Select a Game:</h2>
      </div>

      { /* Render, for each game, a selectable tab */ }
      <div className="simple-game-select-tabs">
        { games.map(gameObj => {
          const num = countType && gameObj[countType];
          return (
            <div
              className={ `simple-game-select-tab${ gameObj.abb === game.abb ? " simple-game-select-tab-active" : "" }` }
              onClick={ () => setGame(gameObj) }
              key={ gameObj.abb }
            >
              <BoxArt game={ gameObj } imageReducer={ imageReducer } width={ 50 } />
              <span>{ gameObj.name }{ num && num > 0 ? ` (${ num })` : "" }</span>
            </div>
          );
        })}
      </div>

    </div>
  );
};

/* ===== EXPORTS ===== */
export default SimpleGameSelect;