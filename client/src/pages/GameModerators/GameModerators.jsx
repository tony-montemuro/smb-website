/* ===== IMPORTS ===== */
import "./GameModerators.css";
import { MessageContext, ModeratorLayoutContext, UserContext } from "../../utils/Contexts";
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import SimpleGameSelect from "../../components/SimpleGameSelect/SimpleGameSelect.jsx";

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

  /* ===== STATES ===== */
  const [game, setGame] = useState(undefined);

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
      <SimpleGameSelect
        games={ games }
        game={ game }
        setGame={ setGame }
        imageReducer={ imageReducer }
      />

      <div className="game-moderators-content">
        <h1>Game Moderators</h1>
      </div>
    </div>;
};

/* ===== EXPORTS ===== */
export default GameModerators;