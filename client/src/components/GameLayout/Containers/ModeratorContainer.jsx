/* ===== IMPORTS ===== */
import { GameContext } from "../../../utils/Contexts";
import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./ModeratorContainer.module.css";
import Items from "../../Items/Items.jsx";
import UserRow from "../../UserRow/UserRow.jsx";

function ModeratorContainer({ imageReducer }) {
  /* ===== VARIABLES ===== */
  const navigate = useNavigate();

  /* ===== CONTEXTS ===== */

  // game state from game context
  const { game } = useContext(GameContext);

  /* ===== MODERATOR CONTAINER COMPONENT ===== */
  return (
    <Items items={ game.profile } emptyMessage="This game has no moderators.">
      <div className={ styles.moderators }>
        { game.profile.map((profile, index) => {
          return (
            <UserRow 
              user={ profile } 
              imageReducer={ imageReducer } 
              isDetailed={ true } 
              disableLink={ true } 
              onClick={ () => navigate(`/user/${ profile.id }`) }
              index={ index }
              key={ profile.id }
            />
          );
        })}
      </div>
    </Items>
  );

};

/* ===== EXPORTS ===== */
export default ModeratorContainer;