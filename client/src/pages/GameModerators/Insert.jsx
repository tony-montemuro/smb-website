/* ===== IMPORTS ===== */
import { PopupContext } from "../../utils/Contexts";
import { useContext } from "react";
import Username from "../../components/Username/Username";

function Insert({ moderator, submitting, onInsert }) {
  /* ===== CONTEXTS ===== */

  // close popup function from popup context
  const { closePopup } = useContext(PopupContext);

  /* ===== INSERT POPUP COMPONENT ===== */
  return moderator &&
    <div className="game-moderators-insert">

      { /* Render question to user */ }
      <h2>Are you sure you want to add <Username profile={ moderator } /> as a moderator?</h2>

      { /* Render two options user can choose from */ }
      <div className="game-moderators-btns">
        <button type="button" disabled={ submitting } onClick={ closePopup }>No</button>
        <button type="button" disabled={ submitting } onClick={ () => onInsert(moderator, closePopup) }>Yes</button>
      </div>

    </div>;
};

/* ===== EXPORTS ===== */
export default Insert;