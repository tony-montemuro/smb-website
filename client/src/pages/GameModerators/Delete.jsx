/* ===== IMPORTS ===== */
import { PopupContext } from "../../utils/Contexts";
import { useContext } from "react";
import Username from "../../components/Username/Username";

function Delete({ moderator, submitting, onDelete }) {
  /* ===== CONTEXTS ===== */

  // close popup from popup context
  const { closePopup } = useContext(PopupContext);

  /* ===== DELETE POPUP COMPONENT ===== */
  return moderator &&
    <div className="game-moderators-delete">

      { /* Render question to user */ }
      <h2>Are you sure you want to remove <Username profile={ moderator } /> as a moderator?</h2>

      { /* Render two options user can choose from */ }
      <div className="game-moderators-popup-btns">
        <button type="button" disabled={ submitting } onClick={ closePopup }>No</button>
        <button type="button" disabled={ submitting } onClick={ () => onDelete(moderator, closePopup) }>Yes</button>
      </div>

    </div>;
};

/* ===== EXPORTS ===== */
export default Delete;