/* ===== IMPORTS ===== */
import { GameContext } from "../../utils/Contexts";
import { useContext } from "react";
import DetailedUsername from "../DetailedUsername/DetailedUsername";

function ModeratorContainer({ imageReducer }) {
  /* ===== CONTEXTS ===== */

  // game state from game context
  const { game } = useContext(GameContext);

  /* ===== MODERATOR CONTAINER COMPONENT ===== */
  return (
    <div className="game-layout-body-info">
      { game.profile.map(profile => {
        return (
          <div className="game-layout-body-info-moderator-wrapper">
            <DetailedUsername profile={ profile } imageReducer={ imageReducer } key={ profile.id } />
          </div>
        );
      })}
    </div>
  );

};

/* ===== EXPORTS ===== */
export default ModeratorContainer;