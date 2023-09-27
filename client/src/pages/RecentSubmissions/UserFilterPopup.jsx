/* ===== IMPORTS ===== */
import UserFilterPopupLogic from "./UserFilterPopup.js";

function UserFilterPopup({ popup, setPopup, searchParams, setSearchParams }) {
  /* ===== FUNCTIONS ===== */
  const { closePopup } = UserFilterPopupLogic();
  
  /* ===== USER FILTER POPUP COMPONENT ===== */
  return popup &&
    <div className="recent-submissions-popup">
      <div className="recent-submissions-popup-inner">
        <div className="recent-submissions-popup-close-btn">
          <button onClick={ () => closePopup(setPopup) }>Close</button>
        </div>
      </div>
    </div>;
};

/* ===== EXPORTS ===== */
export default UserFilterPopup;