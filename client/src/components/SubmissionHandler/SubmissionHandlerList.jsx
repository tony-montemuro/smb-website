/* ===== IMPORTS ===== */
import { ModeratorLayoutContext } from "../../utils/Contexts";
import { useContext } from "react";
import BoxArt from "../BoxArt/BoxArt.jsx";

function SubmissionHandlerList({ recent, gameAbb, setGameAbb, imageReducer }) {
  /* ===== CONTEXTS ===== */

  // games context from moderator layout
  const { games } = useContext(ModeratorLayoutContext);

  /* ===== SUBMISSION HANDLER LIST COMPONENT ===== */
  return (
    <div className="submission-handler-list">
      <div className="submission-handler-list-title">
        <h2>Select a Game:</h2>
      </div>
      <div className="submission-handler-list-tabs">
        { Object.entries(recent)
          .sort((a, b) => b[1].length - a[1].length)
          .map(row => {
            const abb = row[0];
            const num = row[1].length;
            const game = games.find(row => row.abb === abb);
            return ( 
              <div
                className={ `submission-handler-list-tab${ abb === gameAbb ? " submission-handler-list-tab-active" : "" }` }
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
export default SubmissionHandlerList;