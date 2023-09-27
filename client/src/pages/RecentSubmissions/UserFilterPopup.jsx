/* ===== IMPORTS ===== */
import { useEffect } from "react";
import UserFilterPopupLogic from "./UserFilterPopup.js";

function UserFilterPopup({ popup, setPopup, searchParams, setSearchParams }) {
  /* ===== FUNCTIONS ===== */
  const { fetchUsers, closePopup } = UserFilterPopupLogic();

  /* ===== EFFECTS ===== */

  // code that is executed when the component mounts
  useEffect(() => {
    fetchUsers(searchParams);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  /* ===== USER FILTER POPUP COMPONENT ===== */
  return popup &&
    <div className="recent-submissions-popup">
      <div className="recent-submissions-popup-inner">

        { /* Render buttom to close the popup */ }
        <div className="recent-submissions-popup-close-btn">
          <button onClick={ () => closePopup(setPopup) }>Close</button>
        </div>

        { /* Render name of component */ }
        <h1>Filter by User</h1>

      </div>
    </div>;
};

/* ===== EXPORTS ===== */
export default UserFilterPopup;