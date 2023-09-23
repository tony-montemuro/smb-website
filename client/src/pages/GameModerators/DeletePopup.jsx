/* ===== IMPORTS ===== */
import Username from "../../components/Username/Username";

function DeletePopup({ moderator, setModerator, onDelete }) {
  /* ===== DELETE POPUP COMPONENT ===== */
  return moderator &&
    <div className="game-moderators-popup">
      <div className="game-moderators-popup-inner">
        { /* Close button - allows moderator to simply close the popup if they mistakenly opened it */ }
        <div className="game-moderators-popup-close-btn">
          <button type="button" onClick={ () => setModerator(null) }>Close</button>
        </div>

        { /* Render question to user */ }
        <h2>Are you sure you want to remove <Username profile={ moderator } /> as a moderator?</h2>

        { /* Render two options user can choose from */ }
        <div className="game-moderators-popup-btns">
          <button type="button" onClick={ () => setModerator(null) }>No</button>
          <button type="button" onClick={ () => onDelete(moderator, setModerator) }>Yes</button>
        </div>

      </div>
    </div>;
};

/* ===== EXPORTS ===== */
export default DeletePopup;