/* ===== IMPORTS ===== */
import "./GameModerators.css";
import { MessageContext, ModeratorLayoutContext, UserContext } from "../../utils/Contexts";
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DeletePopup from "./DeletePopup";
import GameModeratorsLogic from "./GameModerators.js";
import SimpleGameSelect from "../../components/SimpleGameSelect/SimpleGameSelect.jsx";
import UserRow from "../../components/UserRow/UserRow.jsx";

function GameModerators({ imageReducer }) {
  /* ===== VARIABLES ===== */
  const navigate = useNavigate();

  /* ===== CONTEXTS ===== */

  // add message function from message context
  const { addMessage } = useContext(MessageContext);

  // games state from modereator layout context
  const { games } = useContext(ModeratorLayoutContext);

  // user state from user context
  const { user } = useContext(UserContext);

  /* ===== STATES & FUNCTIONS ===== */
  const [game, setGame] = useState(undefined);
  const [moderator, setModerator] = useState(undefined);

  // states and functions from the js file
  const { removeModerator } = GameModeratorsLogic(game);

  /* ===== EFFECTS ===== */

  // code that is executed when the component mounts OR when the user state is updated
  useEffect(() => {
    if (!user.profile.administrator) {
      addMessage("Forbidden access.", "error");
      navigate("/");
      return;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // code that is executed when the component mounts OR when the games state is updated
  useEffect(() => {
    if (games) {
      setGame(games[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [games]);
  
  /* ===== GAME MODERATOR COMPONENT ===== */
  return game &&
    <div className="game-moderators">

      { /* Simple game select - render a column of games to select from */ }
      <SimpleGameSelect
        games={ games }
        game={ game }
        setGame={ setGame }
        imageReducer={ imageReducer }
      />

      <div className="game-moderators-content">
        <h1>Game Moderators</h1>

        { /* Game moderators current - render list of all current moderators */ }
        <div className="game-moderators-current">
          <h2>Current Moderators</h2>

          { /* If at least 1 moderator exists, render it */ }
          { game.moderators.length > 0 ?

            <div className="game-moderators-list">
              <p>Select a moderator to remove them!</p>
              { game.moderators.map(moderator => {
                return (
                  <UserRow  
                    user={ moderator }
                    disableLink={ true }
                    onClick={ setModerator }
                  />
                );
              })}
            </div>
          :

          // Otherwise, render message to admin that they should add some
          <p className="game-moderators-current-empty">This game has no moderators! You should at at least one.</p> 
          }

        </div>

        <DeletePopup moderator={ moderator } setModerator={ setModerator } onDelete={ removeModerator } />

      </div>
    </div>;
};

/* ===== EXPORTS ===== */
export default GameModerators;