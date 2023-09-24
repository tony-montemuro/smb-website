/* ===== IMPORTS ===== */
import Username from "../../components/Username/Username";

function InsertPopup({ moderator, setModerator, submitting, onInsert }) {
  /* ===== INSERT POPUP COMPONENT ===== */
  return moderator &&
    <div className="game-moderators-popup">
      <div className="game-moderators-popup-inner">
        
        { /* Close button - allows moderator to simply close the popup if they mistakenly opened it */ }
        <div className="game-moderators-popup-close-btn">
          <button type="button" disabled={ submitting } onClick={ () => setModerator(null) }>Close</button>
        </div>

        { /* Render question to user */ }
        <h2>Are you sure you want to add <Username profile={ moderator } /> as a moderator?</h2>

        { /* Render two options user can choose from */ }
        <div className="game-moderators-popup-btns">
          <button type="button" disabled={ submitting } onClick={ () => setModerator(null) }>No</button>
          <button type="button" disabled={ submitting } onClick={ () => onInsert(moderator, setModerator) }>Yes</button>
        </div>

      </div>
    </div>;
};

/* ===== EXPORTS ===== */
export default InsertPopup;