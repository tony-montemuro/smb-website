/* ===== IMPORTS ===== */
import BoxArt from "../BoxArt/BoxArt.jsx";

function SubmissionHandlerList({ games, isUnapproved, game, setGame, imageReducer }) {
  /* ===== SUBMISSION HANDLER LIST COMPONENT ===== */
  return (
    <div className="submission-handler-list">
      <div className="submission-handler-list-title">
        <h2>Select a Game:</h2>
      </div>
      <div className="submission-handler-list-tabs">
        { games.map(gameObj => {
            const num = isUnapproved ? gameObj.unapproved : gameObj.reported;
            return ( 
              <div
                className={ `submission-handler-list-tab${ gameObj.abb === game.abb ? " submission-handler-list-tab-active" : "" }` }
                onClick={ () => setGame(gameObj) }
                key={ gameObj.abb }
              >
                <BoxArt game={ gameObj } imageReducer={ imageReducer } width={ 50 } />
                <span>{ gameObj.name }{ num > 0 && ` (${ num })` }</span>
              </div>
            );
        })}
      </div>
    </div>
  );
};

/* ===== EXPORTS ===== */
export default SubmissionHandlerList;